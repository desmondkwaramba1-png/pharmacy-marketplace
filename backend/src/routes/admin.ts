import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getInventory,
  updateInventoryItem,
  addMedicineToInventory,
  removeInventoryItem,
  getPharmacyProfile,
  updatePharmacyProfile,
  getAnalytics,
  uploadImage,
} from '../controllers/adminController';
import {
  syncMedicines,
  syncPharmacies,
  checkMedicine,
  checkPharmacy,
} from '../controllers/mcazController';
import { upload } from '../middleware/upload';

const router = Router();

// All admin routes require authentication
router.use(authenticate as any);

router.get('/inventory', getInventory);
router.put('/inventory/:medicineId', updateInventoryItem);
router.post('/inventory', addMedicineToInventory);
router.delete('/inventory/:medicineId', removeInventoryItem);

router.get('/pharmacy', getPharmacyProfile);
router.put('/pharmacy', updatePharmacyProfile);

router.post('/upload-image', upload.single('image'), uploadImage);

router.get('/analytics', getAnalytics);

// MCAZ scraper routes
router.post('/mcaz/sync-medicines', syncMedicines);
router.post('/mcaz/sync-pharmacies', syncPharmacies);
router.get('/mcaz/check-medicine', checkMedicine);
router.get('/mcaz/check-pharmacy', checkPharmacy);

export default router;
