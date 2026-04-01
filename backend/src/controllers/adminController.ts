import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { emitStockUpdate } from '../lib/socket';

export async function getInventory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId } = req.user!;
    if (!pharmacyId) {
      res.status(400).json({ error: 'No pharmacy linked to your account' });
      return;
    }

    const { status, q, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(100, parseInt(String(limit)));

    const inventory = await prisma.pharmacyInventory.findMany({
      where: {
        pharmacyId,
        ...(status ? { stockStatus: String(status) } : {}),
        ...(q
          ? {
              medicine: {
                OR: [
                  { genericName: { contains: String(q) } },
                  { brandName: { contains: String(q) } },
                ],
              },
            }
          : {}),
      },
      include: { medicine: true, updatedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { medicine: { genericName: 'asc' } },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    const total = await prisma.pharmacyInventory.count({
      where: {
        pharmacyId,
        ...(status ? { stockStatus: String(status) } : {}),
      },
    });

    const stats = await prisma.pharmacyInventory.groupBy({
      by: ['stockStatus'],
      where: { pharmacyId },
      _count: { stockStatus: true },
    });

    res.json({ inventory, total, page: pageNum, limit: limitNum, stats });
  } catch (err) {
    console.error('getInventory error:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function updateInventoryItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId, id: userId } = req.user!;
    const { medicineId } = req.params;
    const { stockStatus, quantity, price } = req.body;

    if (!pharmacyId) {
      res.status(400).json({ error: 'No pharmacy linked to your account' });
      return;
    }

    if (!['in_stock', 'low_stock', 'out_of_stock'].includes(stockStatus)) {
      res.status(400).json({ error: 'Invalid stock status' });
      return;
    }

    const item = await prisma.pharmacyInventory.upsert({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
      update: {
        stockStatus,
        quantity: quantity ?? 0,
        price,
        lastUpdated: new Date(),
        updatedById: userId,
      },
      create: {
        pharmacyId,
        medicineId,
        stockStatus,
        quantity: quantity ?? 0,
        price,
        updatedById: userId,
      },
      include: { medicine: true },
    });

    // Emit real-time update
    emitStockUpdate(pharmacyId, medicineId, item.quantity, item.stockStatus);

    res.json(item);
  } catch (err) {
    console.error('updateInventory error:', err);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
}

export async function addMedicineToInventory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId, id: userId } = req.user!;
    if (!pharmacyId) {
      res.status(400).json({ error: 'No pharmacy linked to your account' });
      return;
    }

    const { genericName, brandName, dosage, form, category, description, standardPrice, imageUrl,
      stockStatus = 'in_stock', quantity = 0, price } = req.body;

    if (!genericName) {
      res.status(400).json({ error: 'Generic name is required' });
      return;
    }

    // Find or create medicine
    let medicine = await prisma.medicine.findFirst({
      where: {
        genericName: { equals: genericName },
        dosage: dosage || undefined,
        form: form || undefined,
      },
    });

    if (!medicine) {
      medicine = await prisma.medicine.create({
        data: { genericName, brandName, dosage, form, category, description, standardPrice, imageUrl },
      });
    }

    const inventory = await prisma.pharmacyInventory.upsert({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId: medicine.id } },
      update: { stockStatus, quantity, price, lastUpdated: new Date(), updatedById: userId },
      create: { pharmacyId, medicineId: medicine.id, stockStatus, quantity, price, updatedById: userId },
      include: { medicine: true },
    });

    // Emit real-time update
    emitStockUpdate(pharmacyId, inventory.medicineId, inventory.quantity, inventory.stockStatus);

    res.status(201).json(inventory);
  } catch (err) {
    console.error('addMedicine error:', err);
    res.status(500).json({ error: 'Failed to add medicine' });
  }
}

export async function removeInventoryItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId } = req.user!;
    const { medicineId } = req.params;
    if (!pharmacyId) { res.status(400).json({ error: 'No pharmacy linked' }); return; }

    await prisma.pharmacyInventory.delete({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
    });

    res.json({ message: 'Removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
}

export async function getPharmacyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId } = req.user!;
    if (!pharmacyId) { res.status(404).json({ error: 'No pharmacy linked' }); return; }

    const pharmacy = await prisma.pharmacy.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) { res.status(404).json({ error: 'Pharmacy not found' }); return; }

    res.json({
      ...pharmacy,
      operatingHours: pharmacy.operatingHours ? JSON.parse(pharmacy.operatingHours) : null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updatePharmacyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId } = req.user!;
    if (!pharmacyId) { res.status(400).json({ error: 'No pharmacy linked' }); return; }

    const { name, address, suburb, city, phone, email, latitude, longitude, operatingHours } = req.body;

    const updated = await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(suburb !== undefined && { suburb }),
        ...(city && { city }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) }),
        ...(operatingHours && { operatingHours: JSON.stringify(operatingHours) }),
      },
    });

    res.json({ ...updated, operatingHours: updated.operatingHours ? JSON.parse(updated.operatingHours) : null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pharmacyId } = req.user!;
    if (!pharmacyId) { res.status(400).json({ error: 'No pharmacy linked' }); return; }

    const [totalMedicines, inStock, lowStock, outOfStock, recentSearches] = await Promise.all([
      prisma.pharmacyInventory.count({ where: { pharmacyId } }),
      prisma.pharmacyInventory.count({ where: { pharmacyId, stockStatus: 'in_stock' } }),
      prisma.pharmacyInventory.count({ where: { pharmacyId, stockStatus: 'low_stock' } }),
      prisma.pharmacyInventory.count({ where: { pharmacyId, stockStatus: 'out_of_stock' } }),
      prisma.searchLog.count({
        where: { searchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    res.json({
      totalMedicines,
      inStock,
      lowStock,
      outOfStock,
      weeklySearches: recentSearches,
      directionRequests: 0,
      avgRating: 4.5,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
