import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getScraperLogs,
  triggerScraper,
  getPremise,
  searchMcazMedicines,
  getPerson,
  verifyPharmacy,
  cartComplianceCheck,
} from '../controllers/complianceController';

const router = Router();

// Public endpoints
router.get('/premises/:licenseNumber', getPremise);
router.get('/medicines/search', searchMcazMedicines);
router.get('/persons/:registrationNumber', getPerson);
router.get('/cart-check', cartComplianceCheck);

// Authenticated endpoints
router.use(authenticate as any);
router.get('/scraper-logs', getScraperLogs);
router.post('/run-scraper', triggerScraper);
router.post('/verify-pharmacy', verifyPharmacy);

export default router;
