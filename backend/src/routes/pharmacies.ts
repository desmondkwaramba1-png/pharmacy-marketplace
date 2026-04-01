import { Router } from 'express';
import { getNearbyPharmacies, getPharmacyById } from '../controllers/pharmacyController';

const router = Router();

router.get('/nearby', getNearbyPharmacies);
router.get('/:id', getPharmacyById);

export default router;
