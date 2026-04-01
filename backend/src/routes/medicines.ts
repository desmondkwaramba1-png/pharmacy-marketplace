import { Router } from 'express';
import {
  searchMedicines,
  getMedicineById,
  getPopularMedicines,
} from '../controllers/medicineController';

const router = Router();

router.get('/search', searchMedicines);
router.get('/popular', getPopularMedicines);
router.get('/:id', getMedicineById);

export default router;
