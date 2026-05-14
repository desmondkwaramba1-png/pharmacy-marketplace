import { Router } from 'express';
import { verifyPremisesLicense, listValidLicenseFormats } from '../controllers/complianceController';

const router = Router();

// GET /api/compliance/premises/:licenseNumber
router.get('/premises/:licenseNumber', verifyPremisesLicense);

// GET /api/compliance/formats
router.get('/formats', listValidLicenseFormats);

export default router;
