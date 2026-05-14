import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { runMcazScraper } from '../services/mcaz/scraper';

const prisma = new PrismaClient();

// GET /api/compliance/scraper-logs
export async function getScraperLogs(req: Request, res: Response) {
  const logs = await prisma.scraperLog.findMany({
    orderBy: { ranAt: 'desc' },
    take: 50,
  });
  res.json(logs);
}

// POST /api/compliance/run-scraper  (admin-only)
export async function triggerScraper(req: Request, res: Response) {
  const { targets } = req.body as { targets?: ('premises' | 'medicines' | 'persons')[] };
  res.json({ message: 'Scraper started', targets: targets ?? ['premises', 'medicines', 'persons'] });
  runMcazScraper(targets).catch(err =>
    console.error('[compliance] Manual scraper trigger failed:', err)
  );
}

// GET /api/compliance/premises/:licenseNumber
export async function getPremise(req: Request, res: Response) {
  const { licenseNumber } = req.params;
  const premise = await prisma.mcazPremise.findUnique({ where: { licenseNumber } });
  if (!premise) return res.status(404).json({ error: 'Not found in MCAZ premises register' });
  res.json(premise);
}

// GET /api/compliance/medicines/search?q=
export async function searchMcazMedicines(req: Request, res: Response) {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json([]);

  const results = await prisma.mcazMedicine.findMany({
    where: {
      OR: [
        { productName:  { contains: q } },
        { genericName:  { contains: q } },
        { registrationNumber: { contains: q } },
      ],
    },
    take: 20,
    orderBy: { productName: 'asc' },
  });
  res.json(results);
}

// GET /api/compliance/persons/:registrationNumber
export async function getPerson(req: Request, res: Response) {
  const { registrationNumber } = req.params;
  const person = await prisma.mcazPerson.findUnique({ where: { registrationNumber } });
  if (!person) return res.status(404).json({ error: 'Not found in MCAZ persons register' });
  res.json(person);
}

// POST /api/compliance/verify-pharmacy  { pharmacyId }
export async function verifyPharmacy(req: Request, res: Response) {
  const { pharmacyId } = req.body as { pharmacyId: string };
  if (!pharmacyId) return res.status(400).json({ error: 'pharmacyId required' });

  const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
  if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });
  if (!pharmacy.mcazLicenseNumber) {
    return res.status(422).json({ error: 'No MCAZ license number on file' });
  }

  const premise = await prisma.mcazPremise.findUnique({
    where: { licenseNumber: pharmacy.mcazLicenseNumber },
  });

  if (!premise) {
    await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        mcazVerified: false,
        mcazSuspended: true,
        marketplaceStatus: 'suspended',
        mcazSuspendReason: 'License not found in MCAZ register',
      },
    });
    return res.json({ verified: false, reason: 'License not found in MCAZ register' });
  }

  if (premise.licenseStatus !== 'Active') {
    await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        mcazVerified: false,
        mcazSuspended: true,
        marketplaceStatus: 'suspended',
        mcazSuspendReason: `License status: ${premise.licenseStatus}`,
      },
    });
    return res.json({ verified: false, reason: `License status: ${premise.licenseStatus}` });
  }

  // Address check — warn only, do not block on mismatch.
  // Street address formatting varies widely; suspending on mismatch causes false negatives.
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const vendorAddr  = normalize(pharmacy.address);
  const mcazAddr    = normalize(premise.physicalAddress);
  const addressMatch = mcazAddr.includes(vendorAddr) || vendorAddr.includes(mcazAddr);

  await prisma.pharmacy.update({
    where: { id: pharmacyId },
    data: {
      mcazVerified: true,
      mcazSuspended: false,
      marketplaceStatus: 'active',
      mcazVerifiedAt: new Date(),
      mcazSuspendReason: addressMatch ? null : 'Address may not match MCAZ register — please verify',
    },
  });

  return res.json({
    verified: true,
    premise,
    warning: addressMatch ? null : 'Registered address does not exactly match MCAZ record — please verify manually.',
  });
}

// GET /api/compliance/cart-check?pharmacyId=&medicineIds[]=
export async function cartComplianceCheck(req: Request, res: Response) {
  const { pharmacyId } = req.query as { pharmacyId: string };
  const medicineIds = ([] as string[]).concat((req.query.medicineIds as any) || []);

  if (!pharmacyId) return res.status(400).json({ error: 'pharmacyId required' });

  const pharmacy = await prisma.pharmacy.findUnique({
    where: { id: pharmacyId },
    select: { marketplaceStatus: true, mcazSuspended: true },
  });
  if (!pharmacy || pharmacy.marketplaceStatus !== 'active') {
    return res.status(403).json({ error: 'Pharmacy is not currently active on the marketplace' });
  }

  const medicines = await prisma.medicine.findMany({
    where: { id: { in: medicineIds } },
    select: {
      id: true,
      genericName: true,
      distributionCategory: true,
      requiresPrescription: true,
      advertisingClass: true,
      isBanned: true,
    },
  });

  const issues = medicines.filter(m => m.requiresPrescription || m.isBanned);
  res.json({ ok: issues.length === 0, medicines, issues });
}
