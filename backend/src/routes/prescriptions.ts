import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescriptionById,
} from '../controllers/prescriptionController';

const router = Router();

// Upload prescription — auth optional (guest checkout may upload a prescription)
router.post('/upload', upload.single('prescription'), uploadPrescription as any);

// Authenticated routes
router.get('/', authenticate as any, getUserPrescriptions as any);
router.get('/:id', authenticate as any, getPrescriptionById as any);

export default router;
