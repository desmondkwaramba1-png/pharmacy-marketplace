import axios from 'axios';
import prisma from '../lib/prisma';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface McazMedicineResult {
  found: boolean;
  mcazRegNumber?: string;
  schedule?: string; // S0 | S1 | S2 | S3 | S4
  requiresPrescription: boolean; // true if S3 or S4
  otcAllowed: boolean; // true if S0, S1, or S2
  registrationStatus?: string;
  expiryDate?: string;
  manufacturer?: string;
}

export interface McazPharmacyResult {
  found: boolean;
  licenseNumber?: string;
  licenseExpiry?: string;
  isActive: boolean;
  licenseValid: boolean;
}

export interface SyncResult {
  total: number;
  updated: number;
  errors: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MCAZ_MEDICINES_URL =
  'https://www.mcaz.co.zw/index.php/registers/medicines-register';
const MCAZ_PHARMACY_URL =
  'https://www.mcaz.co.zw/index.php/registers/pharmaceutical-premises';

const REQUEST_TIMEOUT_MS = 3000;
const BATCH_DELAY_MS = 500;

const HTTP_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; PharmacyMarketplaceBot/1.0; +https://pharmacy-marketplace.co.zw)',
  Accept: 'text/html,application/xhtml+xml',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine schedule code from a raw string found in the MCAZ table.
 * Returns the canonical "SX" code or undefined.
 */
function extractSchedule(raw: string): string | undefined {
  const match = raw.match(/\b(S[0-4])\b/i);
  if (match) return match[1].toUpperCase();
  return undefined;
}

function scheduleRequiresPrescription(schedule: string | undefined): boolean {
  if (!schedule) return false;
  return schedule === 'S3' || schedule === 'S4';
}

function scheduleIsOtc(schedule: string | undefined): boolean {
  if (!schedule) return true; // default: assume OTC when unknown
  return schedule === 'S0' || schedule === 'S1' || schedule === 'S2';
}

/**
 * Fetch HTML from MCAZ with search params, returning empty string on failure.
 */
async function fetchMcazPage(
  url: string,
  params: Record<string, string>
): Promise<string> {
  try {
    const response = await axios.get<string>(url, {
      params,
      headers: HTTP_HEADERS,
      timeout: REQUEST_TIMEOUT_MS,
      responseType: 'text',
    });
    return response.data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[mcazScraper] Failed to fetch ${url}: ${message}`);
    return '';
  }
}

/**
 * Extract all <tr> row strings from a HTML table body.
 */
function extractTableRows(html: string): string[] {
  const rows: string[] = [];
  // Match every <tr ...>...</tr> block (non-greedy)
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match: RegExpExecArray | null;
  while ((match = trPattern.exec(html)) !== null) {
    rows.push(match[0]);
  }
  return rows;
}

/**
 * Extract text content from all <td> cells in a single row string.
 */
function extractCells(row: string): string[] {
  const cells: string[] = [];
  const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let match: RegExpExecArray | null;
  while ((match = tdPattern.exec(row)) !== null) {
    // Strip inner HTML tags and trim
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    cells.push(text);
  }
  return cells;
}

// ─── Core scraping functions ──────────────────────────────────────────────────

/**
 * Check if a specific medicine is registered on MCAZ and get its details.
 * Returns sensible defaults if the MCAZ website is unreachable.
 */
export async function checkMedicineOnMCAZ(
  medicineName: string
): Promise<McazMedicineResult> {
  const defaultResult: McazMedicineResult = {
    found: false,
    requiresPrescription: false,
    otcAllowed: true,
  };

  const html = await fetchMcazPage(MCAZ_MEDICINES_URL, {
    search: medicineName,
    'filter[search]': medicineName,
  });

  if (!html) return defaultResult;

  const rows = extractTableRows(html);

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length < 3) continue;

    // Check if any cell contains our medicine name (case-insensitive)
    const rowText = cells.join(' ').toLowerCase();
    if (!rowText.includes(medicineName.toLowerCase())) continue;

    // Attempt to identify columns by position or content.
    // Typical MCAZ medicines register columns (order may vary):
    // Reg Number | Product Name | Manufacturer | Schedule | Status | Expiry
    let mcazRegNumber: string | undefined;
    let schedule: string | undefined;
    let registrationStatus: string | undefined;
    let expiryDate: string | undefined;
    let manufacturer: string | undefined;

    for (const cell of cells) {
      // Reg number: typically looks like "MZ-NNN-NNN" or "MCAZ/..."
      if (!mcazRegNumber && /^(MZ|MCAZ)[/-]\S+/i.test(cell)) {
        mcazRegNumber = cell;
      }
      // Schedule
      if (!schedule && /\bS[0-4]\b/i.test(cell)) {
        schedule = extractSchedule(cell);
      }
      // Status keywords
      if (!registrationStatus && /\b(active|expired|cancelled|suspended)\b/i.test(cell)) {
        registrationStatus = cell;
      }
      // Date pattern
      if (!expiryDate && /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(cell)) {
        expiryDate = cell;
      }
    }

    // Manufacturer is often the 3rd cell if reg number is 1st and name is 2nd
    if (!manufacturer && cells.length >= 3) {
      const idx = cells.findIndex((c) =>
        c.toLowerCase().includes(medicineName.toLowerCase())
      );
      if (idx >= 0 && cells[idx + 1]) {
        manufacturer = cells[idx + 1];
      }
    }

    return {
      found: true,
      mcazRegNumber,
      schedule,
      requiresPrescription: scheduleRequiresPrescription(schedule),
      otcAllowed: scheduleIsOtc(schedule),
      registrationStatus,
      expiryDate,
      manufacturer,
    };
  }

  return defaultResult;
}

/**
 * Check if a pharmacy is licensed and active on the MCAZ register.
 * Returns sensible defaults if the MCAZ website is unreachable.
 */
export async function checkPharmacyLicense(
  pharmacyName: string
): Promise<McazPharmacyResult> {
  const defaultResult: McazPharmacyResult = {
    found: false,
    isActive: false,
    licenseValid: false,
  };

  const html = await fetchMcazPage(MCAZ_PHARMACY_URL, {
    search: pharmacyName,
    'filter[search]': pharmacyName,
  });

  if (!html) return defaultResult;

  const rows = extractTableRows(html);

  for (const row of rows) {
    const cells = extractCells(row);
    if (cells.length < 2) continue;

    const rowText = cells.join(' ').toLowerCase();
    if (!rowText.includes(pharmacyName.toLowerCase())) continue;

    let licenseNumber: string | undefined;
    let licenseExpiry: string | undefined;
    let isActive = false;

    for (const cell of cells) {
      if (!licenseNumber && /^(PH|LIC|ZW)[/-]?\d+/i.test(cell)) {
        licenseNumber = cell;
      }
      if (/\b(active|valid|current)\b/i.test(cell)) {
        isActive = true;
      }
      if (!licenseExpiry && /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(cell)) {
        licenseExpiry = cell;
      }
    }

    // If we found a row but no explicit "active" keyword, check for "expired"
    const hasExpired = /\b(expired|cancelled|suspended|inactive)\b/i.test(rowText);
    if (!hasExpired && !isActive) {
      // Assume active if no negative indicator found
      isActive = true;
    }

    return {
      found: true,
      licenseNumber,
      licenseExpiry,
      isActive,
      licenseValid: isActive,
    };
  }

  return defaultResult;
}

/**
 * Batch sync all medicines in the database against MCAZ.
 */
export async function syncMedicinesWithMCAZ(): Promise<SyncResult> {
  const result: SyncResult = { total: 0, updated: 0, errors: [] };

  let medicines: { id: string; genericName: string; brandName: string | null }[];
  try {
    medicines = await prisma.medicine.findMany({
      select: { id: true, genericName: true, brandName: true },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`DB fetch error: ${message}`);
    return result;
  }

  result.total = medicines.length;

  for (const medicine of medicines) {
    const searchName = medicine.brandName ?? medicine.genericName;
    try {
      const mcazData = await checkMedicineOnMCAZ(searchName);

      await prisma.medicine.update({
        where: { id: medicine.id },
        data: {
          mcazRegistered: mcazData.found,
          mcazRegNumber: mcazData.mcazRegNumber ?? null,
          mcazSchedule: mcazData.schedule ?? null,
          requiresPrescription: mcazData.requiresPrescription,
          otcAllowed: mcazData.otcAllowed,
        },
      });

      result.updated += 1;
      console.log(
        `[mcazScraper] Synced medicine "${searchName}": found=${mcazData.found}, schedule=${mcazData.schedule ?? 'n/a'}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`Medicine "${searchName}" (${medicine.id}): ${message}`);
    }

    await sleep(BATCH_DELAY_MS);
  }

  return result;
}

/**
 * Batch sync all pharmacies in the database against MCAZ.
 */
export async function syncPharmaciesWithMCAZ(): Promise<SyncResult> {
  const result: SyncResult = { total: 0, updated: 0, errors: [] };

  let pharmacies: { id: string; name: string }[];
  try {
    pharmacies = await prisma.pharmacy.findMany({
      select: { id: true, name: true },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(`DB fetch error: ${message}`);
    return result;
  }

  result.total = pharmacies.length;

  for (const pharmacy of pharmacies) {
    try {
      const mcazData = await checkPharmacyLicense(pharmacy.name);

      await prisma.pharmacy.update({
        where: { id: pharmacy.id },
        data: {
          mcazVerified: mcazData.found,
          licenseNumber: mcazData.licenseNumber ?? null,
          licenseValid: mcazData.found ? mcazData.licenseValid : true, // keep existing if not found
          licenseExpiry: mcazData.licenseExpiry
            ? new Date(mcazData.licenseExpiry)
            : null,
        },
      });

      result.updated += 1;
      console.log(
        `[mcazScraper] Synced pharmacy "${pharmacy.name}": found=${mcazData.found}, valid=${mcazData.licenseValid}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`Pharmacy "${pharmacy.name}" (${pharmacy.id}): ${message}`);
    }

    await sleep(BATCH_DELAY_MS);
  }

  return result;
}
