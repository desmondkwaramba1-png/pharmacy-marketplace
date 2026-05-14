import { Request, Response } from 'express';
import {
  checkMedicineOnMCAZ,
  checkPharmacyLicense,
  syncMedicinesWithMCAZ,
  syncPharmaciesWithMCAZ,
} from '../services/mcazScraper';

/**
 * POST /api/admin/mcaz/sync-medicines
 * Batch-syncs all medicines in the DB against the MCAZ medicines register.
 */
export async function syncMedicines(req: Request, res: Response): Promise<void> {
  try {
    console.log('[mcazController] Starting medicines sync...');
    const result = await syncMedicinesWithMCAZ();
    res.json({
      message: 'Medicines sync complete',
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[mcazController] syncMedicines error:', message);
    res.status(500).json({ error: 'Failed to sync medicines with MCAZ' });
  }
}

/**
 * POST /api/admin/mcaz/sync-pharmacies
 * Batch-syncs all pharmacies in the DB against the MCAZ pharmacy register.
 */
export async function syncPharmacies(req: Request, res: Response): Promise<void> {
  try {
    console.log('[mcazController] Starting pharmacies sync...');
    const result = await syncPharmaciesWithMCAZ();
    res.json({
      message: 'Pharmacies sync complete',
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[mcazController] syncPharmacies error:', message);
    res.status(500).json({ error: 'Failed to sync pharmacies with MCAZ' });
  }
}

/**
 * GET /api/admin/mcaz/check-medicine?name=xxx
 * Check a single medicine against MCAZ.
 */
export async function checkMedicine(req: Request, res: Response): Promise<void> {
  const name = req.query['name'] as string | undefined;
  if (!name) {
    res.status(400).json({ error: 'Query param "name" is required' });
    return;
  }

  try {
    const result = await checkMedicineOnMCAZ(name);
    res.json({ name, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[mcazController] checkMedicine error:', message);
    res.status(500).json({ error: 'Failed to check medicine on MCAZ' });
  }
}

/**
 * GET /api/admin/mcaz/check-pharmacy?name=xxx
 * Check a single pharmacy against MCAZ.
 */
export async function checkPharmacy(req: Request, res: Response): Promise<void> {
  const name = req.query['name'] as string | undefined;
  if (!name) {
    res.status(400).json({ error: 'Query param "name" is required' });
    return;
  }

  try {
    const result = await checkPharmacyLicense(name);
    res.json({ name, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[mcazController] checkPharmacy error:', message);
    res.status(500).json({ error: 'Failed to check pharmacy on MCAZ' });
  }
}
