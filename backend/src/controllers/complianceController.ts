import { Request, Response } from 'express';

// MCAZ premises register — realistic mock data for Zimbabwe pharmacies
// Format mirrors what the real MCAZ premises register returns
const MCAZ_PREMISES_DB: Record<string, {
  licenseNumber: string;
  premiseName: string;
  ownerName: string;
  address: string;
  city: string;
  licenseStatus: 'Active' | 'Inactive' | 'Suspended' | 'Expired';
  licenseType: string;
  issueDate: string;
  expiryDate: string;
}> = {
  'PH-0001': { licenseNumber: 'PH-0001', premiseName: 'Avenues Pharmacy', ownerName: 'Dr T. Moyo', address: '123 Samora Machel Ave', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2022-01-15', expiryDate: '2026-01-14' },
  'PH-0002': { licenseNumber: 'PH-0002', premiseName: 'Borrowdale Health Pharmacy', ownerName: 'Mrs R. Ndhlovu', address: '45 Borrowdale Rd', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2023-03-01', expiryDate: '2026-02-28' },
  'PH-0003': { licenseNumber: 'PH-0003', premiseName: 'Chitungwiza Central Pharmacy', ownerName: 'Mr E. Chikwanda', address: 'Unit K, Chitungwiza', city: 'Chitungwiza', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2021-07-10', expiryDate: '2025-07-09' },
  'PH-0004': { licenseNumber: 'PH-0004', premiseName: 'Delta Dispensary', ownerName: 'Dr A. Mutasa', address: '12 Jason Moyo Ave', city: 'Harare', licenseStatus: 'Expired', licenseType: 'Retail Pharmacy', issueDate: '2020-06-01', expiryDate: '2023-05-31' },
  'PH-0005': { licenseNumber: 'PH-0005', premiseName: 'Eastgate Mall Pharmacy', ownerName: 'Mrs P. Gumbura', address: 'Shop 23, Eastgate Mall', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2024-01-01', expiryDate: '2026-12-31' },
  'PH-0006': { licenseNumber: 'PH-0006', premiseName: 'First Street Health Centre', ownerName: 'Dr K. Sibanda', address: '99 First St', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2023-09-15', expiryDate: '2026-09-14' },
  'PH-0007': { licenseNumber: 'PH-0007', premiseName: 'Green Cross Pharmacy', ownerName: 'Mr L. Ncube', address: '7 Manica Rd', city: 'Harare', licenseStatus: 'Suspended', licenseType: 'Retail Pharmacy', issueDate: '2022-04-20', expiryDate: '2025-04-19' },
  'PH-0008': { licenseNumber: 'PH-0008', premiseName: 'Highlands Wellness Pharmacy', ownerName: 'Mrs F. Chigumba', address: '2 Scott Ave, Highlands', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2023-11-01', expiryDate: '2026-10-31' },
  'PH-0009': { licenseNumber: 'PH-0009', premiseName: 'Inyati Road Pharmacy', ownerName: 'Dr S. Dube', address: '56 Inyati Rd, Bulawayo', city: 'Bulawayo', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2022-08-01', expiryDate: '2025-07-31' },
  'PH-0010': { licenseNumber: 'PH-0010', premiseName: 'Jason Moyo Health Pharmacy', ownerName: 'Mr W. Mutsvairo', address: '33 Jason Moyo Ave', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2024-03-01', expiryDate: '2027-02-28' },
  'PH-0011': { licenseNumber: 'PH-0011', premiseName: 'Kwame Nkrumah Dispensary', ownerName: 'Mrs J. Mupambi', address: '14 Kwame Nkrumah Ave', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2023-05-15', expiryDate: '2026-05-14' },
  'PH-0012': { licenseNumber: 'PH-0012', premiseName: 'Lobengula Pharmacy', ownerName: 'Dr B. Moyo', address: '88 Lobengula St, Bulawayo', city: 'Bulawayo', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2022-12-01', expiryDate: '2025-11-30' },
  'MCAZ-2024-001': { licenseNumber: 'MCAZ-2024-001', premiseName: 'City Health Pharmacy', ownerName: 'Dr N. Banda', address: '5 Central Ave', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2024-01-15', expiryDate: '2026-01-14' },
  'MCAZ-2024-002': { licenseNumber: 'MCAZ-2024-002', premiseName: 'Sunshine Pharmacy Mutare', ownerName: 'Mrs C. Makoni', address: '22 Herbert Chitepo St', city: 'Mutare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2024-02-01', expiryDate: '2026-01-31' },
  'MCAZ-2023-015': { licenseNumber: 'MCAZ-2023-015', premiseName: 'Premier Pharmacy Gweru', ownerName: 'Mr D. Chivhanga', address: '10 Robert Mugabe Way', city: 'Gweru', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2023-06-01', expiryDate: '2025-05-31' },
  'TEST-LICENSE': { licenseNumber: 'TEST-LICENSE', premiseName: 'Demo Pharmacy (Test)', ownerName: 'Test Owner', address: '1 Test Street', city: 'Harare', licenseStatus: 'Active', licenseType: 'Retail Pharmacy', issueDate: '2024-01-01', expiryDate: '2026-12-31' },
};

export async function verifyPremisesLicense(req: Request, res: Response): Promise<void> {
  try {
    const { licenseNumber } = req.params;

    if (!licenseNumber || licenseNumber.trim().length < 3) {
      res.status(400).json({ error: 'Invalid license number format' });
      return;
    }

    const normalized = licenseNumber.trim().toUpperCase();

    // Look up in MCAZ register (mock)
    const premise = MCAZ_PREMISES_DB[normalized] ||
      Object.values(MCAZ_PREMISES_DB).find(p => p.licenseNumber.toUpperCase() === normalized);

    if (!premise) {
      res.status(404).json({
        found: false,
        licenseStatus: 'Not Found',
        message: 'License number not found in the MCAZ premises register. Ensure you have entered the correct license number.',
      });
      return;
    }

    // Check expiry
    const expiry = new Date(premise.expiryDate);
    const isExpired = expiry < new Date();
    const effectiveStatus = isExpired ? 'Expired' : premise.licenseStatus;

    res.json({
      found: true,
      licenseNumber: premise.licenseNumber,
      premiseName: premise.premiseName,
      ownerName: premise.ownerName,
      address: `${premise.address}, ${premise.city}`,
      city: premise.city,
      licenseStatus: effectiveStatus,
      licenseType: premise.licenseType,
      issueDate: premise.issueDate,
      expiryDate: premise.expiryDate,
      isExpired,
    });
  } catch (err) {
    console.error('verifyPremisesLicense error:', err);
    res.status(500).json({ error: 'Failed to verify license' });
  }
}

export async function listValidLicenseFormats(_req: Request, res: Response): Promise<void> {
  res.json({
    formats: [
      'PH-XXXX (e.g. PH-0001)',
      'MCAZ-YYYY-XXX (e.g. MCAZ-2024-001)',
    ],
    note: 'Contact MCAZ at mcaz.co.zw to obtain your premises license number before registering.',
  });
}
