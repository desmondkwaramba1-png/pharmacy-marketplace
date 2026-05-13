import { Router } from 'express';
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

// Public / app-internal endpoints
router.get('/medicines/search', searchMcazMedicines);
router.get('/premises/:licenseNumber', getPremise);
router.get('/persons/:registrationNumber', getPerson);
router.get('/cart-check', cartComplianceCheck);

// Admin-facing endpoints (add auth middleware as needed)
router.get('/scraper-logs', getScraperLogs);
router.post('/run-scraper', triggerScraper);
router.post('/verify-pharmacy', verifyPharmacy);

export default router;
