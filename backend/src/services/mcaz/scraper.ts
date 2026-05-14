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
 *
 * Column layout note: the MCAZ tables render a leading "#" (row number)
 * column that is NOT a real data field.  All extractRow functions
 * therefore start at index 1, not 0.
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
      await page.waitForSelector('table tbody tr', { timeout: 15_000 }).catch(() => null);

      const rows = await page.$$eval('table tbody tr', (trs: Element[]) =>
        trs.map(tr =>
          Array.from(tr.querySelectorAll('td')).map((td: Element) => (td as HTMLElement).innerText.trim())
        )
      );

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

      const nextBtn = await page.$("li.next:not(.disabled) a, a[rel='next'], .next-page:not([disabled])");
      if (!nextBtn) break;

      await nextBtn.click();
      await randomDelay();
    }
  } finally {
    await browser.close();
  }

  return all;
}

// ── Per-register row extractors ───────────────────────────────────────────────
// NOTE: cols[0] is the "#" row-number column — all real data starts at cols[1].

function extractPremiseRow(cols: string[]): Record<string, any> | null {
  // Expect at least: # | licenseNumber | premiseName | physicalAddress | city | pharmacistInCharge
  if (cols.length < 6) return null;
  return {
    licenseNumber:      cols[1] || null,
    premiseName:        cols[2] || '',
    physicalAddress:    cols[3] || '',
    city:               cols[4] || null,
    pharmacistInCharge: cols[5] || null,
    licenseStatus:      cols[6] || 'Active',
    expiryDate:         cols[7] || null,
  };
}

function extractMedicineRow(cols: string[]): Record<string, any> | null {
  // Expect at least: # | registrationNumber | productName | genericName | strengthForm | distributionCategory
  if (cols.length < 6) return null;
  const raw = cols[5]?.toUpperCase().trim() || 'OTC';
  const dist = raw.includes('PP') ? 'PP' : raw.includes('PIM') ? 'PIM' : 'OTC';
  return {
    registrationNumber:   cols[1] || null,
    productName:          cols[2] || '',
    genericName:          cols[3] || '',
    strengthForm:         cols[4] || '',
    distributionCategory: dist,
    applicantHolder:      cols[6] || null,
  };
}

function extractPersonRow(cols: string[]): Record<string, any> | null {
  // Expect at least: # | registrationNumber | fullName | qualification
  if (cols.length < 4) return null;
  return {
    registrationNumber: cols[1] || null,
    fullName:           cols[2] || '',
    qualification:      cols[3] || null,
    status:             cols[4] || 'Active',
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

// ── Auto-audit pharmacies after a premises scrape ─────────────────────────────

async function auditPharmacyCompliance() {
  const pharmacies = await prisma.pharmacy.findMany({
    where: { mcazLicenseNumber: { not: null } },
    select: { id: true, mcazLicenseNumber: true, address: true },
  });

  for (const pharmacy of pharmacies) {
    const premise = await prisma.mcazPremise.findUnique({
      where: { licenseNumber: pharmacy.mcazLicenseNumber! },
    });

    if (!premise) {
      await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: {
          mcazVerified: false,
          mcazSuspended: true,
          marketplaceStatus: 'suspended',
          mcazSuspendReason: 'License not found in MCAZ register',
        },
      });
      continue;
    }

    if (premise.licenseStatus !== 'Active') {
      await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: {
          mcazVerified: false,
          mcazSuspended: true,
          marketplaceStatus: 'suspended',
          mcazSuspendReason: `License status: ${premise.licenseStatus}`,
        },
      });
      continue;
    }

    // Address check — warn only, never auto-suspend on mismatch (addresses vary in formatting)
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const vendorAddr = normalize(pharmacy.address);
    const mcazAddr   = normalize(premise.physicalAddress);
    const addressMatch = mcazAddr.includes(vendorAddr) || vendorAddr.includes(mcazAddr);

    await prisma.pharmacy.update({
      where: { id: pharmacy.id },
      data: {
        mcazVerified: true,
        mcazSuspended: false,
        marketplaceStatus: 'active',
        mcazVerifiedAt: new Date(),
        mcazSuspendReason: addressMatch ? null : 'Address may not match MCAZ register — please verify',
      },
    });
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
