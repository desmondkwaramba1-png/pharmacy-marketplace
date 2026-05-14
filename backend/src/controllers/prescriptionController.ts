import { Request, Response } from 'express';
import path from 'path';
import prisma from '../lib/prisma';

/**
 * POST /api/prescriptions/upload
 * Upload a prescription image. Requires multer middleware to have already
 * processed the file (available as req.file).
 */
export async function uploadPrescription(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId: string | undefined = (req as any).user?.id;
    const { medicineId } = req.body as { medicineId?: string };

    // Build a URL relative to the uploads static path
    const fileUrl = `/uploads/${path.basename(req.file.path)}`;

    const prescription = await prisma.prescription.create({
      data: {
        userId: userId ?? null,
        medicineId: medicineId ?? null,
        fileUrl,
        status: 'pending',
      },
    });

    res.status(201).json({
      message: 'Prescription uploaded successfully',
      prescription,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[prescriptionController] uploadPrescription error:', message);
    res.status(500).json({ error: 'Failed to upload prescription' });
  }
}

/**
 * GET /api/prescriptions
 * Get all prescriptions belonging to the authenticated user.
 */
export async function getUserPrescriptions(req: Request, res: Response): Promise<void> {
  const userId: string | undefined = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { userId },
      include: { medicine: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ prescriptions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[prescriptionController] getUserPrescriptions error:', message);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
}

/**
 * GET /api/prescriptions/:id
 * Get a single prescription by ID. Ensures it belongs to the authenticated user
 * (admins may access any prescription via their own routes).
 */
export async function getPrescriptionById(req: Request, res: Response): Promise<void> {
  const userId: string | undefined = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { id } = req.params;

  try {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { medicine: true },
    });

    if (!prescription) {
      res.status(404).json({ error: 'Prescription not found' });
      return;
    }

    // Only allow the owner (or admins) to view
    if (prescription.userId !== userId) {
      const user = (req as any).user;
      if (user?.role !== 'admin') {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
    }

    res.json({ prescription });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[prescriptionController] getPrescriptionById error:', message);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
}
