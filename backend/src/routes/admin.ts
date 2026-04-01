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
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication
router.use(authenticate as any);

router.get('/inventory', getInventory);
router.put('/inventory/:medicineId', updateInventoryItem);
router.post('/inventory', addMedicineToInventory);
router.delete('/inventory/:medicineId', removeInventoryItem);

router.get('/pharmacy', getPharmacyProfile);
router.put('/pharmacy', updatePharmacyProfile);

router.get('/analytics', getAnalytics);

export default router;
