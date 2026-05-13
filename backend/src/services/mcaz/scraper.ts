/**
 * MCAZ Portal Scraper
 *
 * Crawls the three MCAZ Online Register tables using Playwright:
 *   1. Approved Premises Register   → mcaz_premises
 *   2. Approved Human Medicines     → mcaz_medicines
 *   3. Approved Persons Register    → mcaz_persons
 *
 * Run on a 24–48 h cron schedule.  Never hammer the portal —
 * random delays of 2–5 s are enforced between page turns.
 */

import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { sendScraperAlert } from './alerts';

const prisma = new PrismaClient();

const URLS = {
  premises:  'https://onlineservices.mcaz.co.zw/onlineregister/Premises?status=1',
  medicines: 'https://onlineservices.mcaz.co.zw/onlineregister/Medicines?category=1',
  persons:   'https://onlineservices.mcaz.co.zw/onlineregister/Persons?status=1',
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

function randomDelay(min = 2000, max = 5000): Promise<void> {
  return new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
}

function randomAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ── Generic paginated table extractor ────────────────────────────────────────

async function scrapePaginatedTable(
  url: string,
  extractRow: (cols: string[]) => Record<string, any> | null,
  maxPages = 100,
): Promise<Record<string, any>[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: randomAgent() });
  const page = await context.newPage();

  const all: Record<string, any>[] = [];

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      // Wait for table to be present
      await page.waitForSelector('table tbody tr', { timeout: 15_000 }).catch(() => null);

      const rows = await page.$$eval('table tbody tr', (trs: Element[]) =>
        trs.map(tr =>
          Array.from(tr.querySelectorAll('td')).map((td: Element) => (td as HTMLElement).innerText.trim())
        )
      );

      // If no data rows found, the selector likely shifted — alert and bail
      if (rows.length === 0) {
        console.warn(`[MCAZ scraper] No rows on page ${pageNum} of ${url}`);
        await sendScraperAlert(url, `No rows found on page ${pageNum} — selector may have changed.`);
        break;
      }

      for (const cols of rows) {
        const parsed = extractRow(cols);
        if (parsed) all.push(parsed);
      }

      console.log(`[MCAZ scraper] ${url} — page ${pageNum}, cumulative rows: ${all.length}`);

      // Try to advance to next page
      const nextBtn = await page.$("li.next:not(.disabled) a, a[rel='next'], .next-page:not([disabled])");
      if (!nextBtn) break; // no more pages

      await nextBtn.click();
      await randomDelay();
    }
  } finally {
    await browser.close();
  }

  return all;
}

// ── Per-register row extractors ───────────────────────────────────────────────

function extractPremiseRow(cols: string[]): Record<string, any> | null {
  if (cols.length < 5) return null;
  return {
    licenseNumber:      cols[0] || null,
    premiseName:        cols[1] || '',
    physicalAddress:    cols[2] || '',
    city:               cols[3] || null,
    pharmacistInCharge: cols[4] || null,
    licenseStatus:      cols[5] || 'Active',
    expiryDate:         cols[6] || null,
  };
}

function extractMedicineRow(cols: string[]): Record<string, any> | null {
  if (cols.length < 5) return null;
  const raw = cols[4]?.toUpperCase().trim() || 'OTC';
  // Normalise to PP | PIM | OTC
  const dist = raw.includes('PP') ? 'PP' : raw.includes('PIM') ? 'PIM' : 'OTC';
  return {
    registrationNumber:   cols[0] || null,
    productName:          cols[1] || '',
    genericName:          cols[2] || '',
    strengthForm:         cols[3] || '',
    distributionCategory: dist,
    applicantHolder:      cols[5] || null,
  };
}

function extractPersonRow(cols: string[]): Record<string, any> | null {
  if (cols.length < 3) return null;
  return {
    registrationNumber: cols[0] || null,
    fullName:           cols[1] || '',
    qualification:      cols[2] || null,
    status:             cols[3] || 'Active',
  };
}

// ── Upsert helpers ────────────────────────────────────────────────────────────

async function upsertPremises(rows: Record<string, any>[]): Promise<number> {
  let count = 0;
  for (const row of rows) {
    if (!row.licenseNumber) continue;
    await prisma.mcazPremise.upsert({
      where:  { licenseNumber: row.licenseNumber },
      create: { ...row, lastScrapedAt: new Date() },
      update: { ...row, lastScrapedAt: new Date() },
    });
    count++;
  }
  return count;
}

async function upsertMedicines(rows: Record<string, any>[]): Promise<number> {
  let count = 0;
  for (const row of rows) {
    if (!row.registrationNumber) continue;
    await prisma.mcazMedicine.upsert({
      where:  { registrationNumber: row.registrationNumber },
      create: { ...row, lastScrapedAt: new Date() },
      update: { ...row, lastScrapedAt: new Date() },
    });

    // Sync distributionCategory + requiresPrescription back onto the RxZim medicine table
    await prisma.medicine.updateMany({
      where: { mcazRegNumber: row.registrationNumber },
      data: {
        distributionCategory: row.distributionCategory,
        requiresPrescription: row.distributionCategory === 'PP',
        advertisingClass: row.distributionCategory === 'PP' ? 'no_public_ad'
                        : row.distributionCategory === 'PIM' ? 'restricted'
                        : 'freely_advertised',
        isMcazVerified: true,
        isBanned: false,
      },
    });
    count++;
  }
  return count;
}

async function upsertPersons(rows: Record<string, any>[]): Promise<number> {
  let count = 0;
  for (const row of rows) {
    if (!row.registrationNumber) continue;
    await prisma.mcazPerson.upsert({
      where:  { registrationNumber: row.registrationNumber },
      create: { ...row, lastScrapedAt: new Date() },
      update: { ...row, lastScrapedAt: new Date() },
    });
    count++;
  }
  return count;
}

// ── Auto-suspend pharmacies whose license expired or status ≠ Active ──────────

async function auditPharmacyCompliance() {
  const pharmacies = await prisma.pharmacy.findMany({
    where: { mcazLicenseNumber: { not: null } },
    select: { id: true, mcazLicenseNumber: true, address: true },
  });

  for (const pharmacy of pharmacies) {
    const premise = await prisma.mcazPremise.findUnique({
      where: { licenseNumber: pharmacy.mcazLicenseNumber! },
    });

    if (!premise || premise.licenseStatus !== 'Active') {
      await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: {
          mcazVerified: false,
          mcazSuspended: true,
          marketplaceStatus: 'suspended',
          mcazSuspendReason: premise
            ? `License status: ${premise.licenseStatus}`
            : 'License not found in MCAZ register',
        },
      });
      continue;
    }

    // Address fuzzy match — strip whitespace/punctuation and substring check
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const vendorAddr  = normalize(pharmacy.address);
    const mcazAddr    = normalize(premise.physicalAddress);
    const addressMatch = mcazAddr.includes(vendorAddr) || vendorAddr.includes(mcazAddr);

    if (!addressMatch) {
      await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: {
          mcazVerified: false,
          mcazSuspended: true,
          marketplaceStatus: 'suspended',
          mcazSuspendReason: 'Registered address does not match MCAZ premises register.',
        },
      });
    } else {
      await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: {
          mcazVerified: true,
          mcazSuspended: false,
          marketplaceStatus: 'active',
          mcazVerifiedAt: new Date(),
          mcazSuspendReason: null,
        },
      });
    }
  }
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function runMcazScraper(targets: ('premises' | 'medicines' | 'persons')[] = ['premises', 'medicines', 'persons']) {
  console.log('[MCAZ scraper] Starting run:', targets.join(', '));

  for (const target of targets) {
    const startedAt = Date.now();
    let rowsFound = 0;

    try {
      if (target === 'premises') {
        const rows = await scrapePaginatedTable(URLS.premises, extractPremiseRow);
        rowsFound = await upsertPremises(rows);
        await auditPharmacyCompliance();
      } else if (target === 'medicines') {
        const rows = await scrapePaginatedTable(URLS.medicines, extractMedicineRow);
        rowsFound = await upsertMedicines(rows);
      } else if (target === 'persons') {
        const rows = await scrapePaginatedTable(URLS.persons, extractPersonRow);
        rowsFound = await upsertPersons(rows);
      }

      await prisma.scraperLog.create({
        data: { target, status: 'success', rowsFound },
      });

      console.log(`[MCAZ scraper] ${target} — done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s, ${rowsFound} rows`);
    } catch (err: any) {
      console.error(`[MCAZ scraper] ${target} failed:`, err.message);
      await prisma.scraperLog.create({
        data: { target, status: 'failed', rowsFound, errorMsg: err.message },
      });
      await sendScraperAlert(target, err.message);
    }
  }
}
