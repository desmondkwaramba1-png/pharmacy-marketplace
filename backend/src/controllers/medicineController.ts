import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { haversineDistance } from '../services/geoService';

export async function searchMedicines(req: Request, res: Response): Promise<void> {
  try {
    const { q, lat, lng, status, page = '1', limit = '20' } = req.query;

    if (!q || String(q).trim().length === 0) {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const query = String(q).trim();
    const userLat = lat ? parseFloat(String(lat)) : null;
    const userLng = lng ? parseFloat(String(lng)) : null;
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit))));
    const offset = (pageNum - 1) * limitNum;

    // Search medicines matching the query
    const medicines = await prisma.medicine.findMany({
      where: {
        OR: [
          { genericName: { contains: query } },
          { brandName: { contains: query } },
          { category: { contains: query } },
        ],
      },
      include: {
        inventory: {
          where: status ? { stockStatus: String(status) } : undefined,
          include: {
            pharmacy: true,
          },
          orderBy: { lastUpdated: 'desc' },
        },
      },
    });

    // Log search
    await prisma.searchLog.create({
      data: {
        searchQuery: query,
        userLat,
        userLng,
        resultsCount: medicines.length,
      },
    });

    // Flatten and enrich results with distance
    const results = medicines.flatMap((medicine) =>
      medicine.inventory
        .filter((inv) => inv.pharmacy && inv.pharmacy.isActive)
        .map((inv) => {
          const distance =
            userLat && userLng
              ? haversineDistance(userLat, userLng, inv.pharmacy.latitude, inv.pharmacy.longitude)
              : null;

          return {
            medicineId: medicine.id,
            medicineName: medicine.genericName,
            imageUrl: medicine.imageUrl,
            brandName: medicine.brandName,
            dosage: medicine.dosage,
            form: medicine.form,
            category: medicine.category,
            pharmacyId: inv.pharmacy.id,
            pharmacyName: inv.pharmacy.name,
            address: inv.pharmacy.address,
            suburb: inv.pharmacy.suburb,
            city: inv.pharmacy.city,
            phone: inv.pharmacy.phone,
            stockStatus: inv.stockStatus,
            quantity: inv.quantity,
            price: inv.price,
            distance,
            lastUpdated: inv.lastUpdated,
          };
        })
    );

    // Sort by distance if available, then stock status (in_stock first)
    const stockOrder: Record<string, number> = { in_stock: 0, low_stock: 1, out_of_stock: 2 };
    results.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return stockOrder[a.stockStatus] - stockOrder[b.stockStatus];
    });

    const paginated = results.slice(offset, offset + limitNum);

    res.json({
      query,
      total: results.length,
      page: pageNum,
      limit: limitNum,
      results: paginated,
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
}

export async function getMedicineById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;
    const userLat = lat ? parseFloat(String(lat)) : null;
    const userLng = lng ? parseFloat(String(lng)) : null;

    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { pharmacy: true },
          orderBy: { lastUpdated: 'desc' },
        },
      },
    });

    if (!medicine) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    const availability = medicine.inventory
      .filter((inv) => inv.pharmacy && inv.pharmacy.isActive)
      .map((inv) => ({
        pharmacyId: inv.pharmacy.id,
        pharmacyName: inv.pharmacy.name,
        address: inv.pharmacy.address,
        suburb: inv.pharmacy.suburb,
        phone: inv.pharmacy.phone,
        latitude: inv.pharmacy.latitude,
        longitude: inv.pharmacy.longitude,
        stockStatus: inv.stockStatus,
        quantity: inv.quantity,
        price: inv.price,
        distance:
          userLat && userLng
            ? haversineDistance(userLat, userLng, inv.pharmacy.latitude, inv.pharmacy.longitude)
            : null,
        lastUpdated: inv.lastUpdated,
      }))
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return 0;
      });

    res.json({
      id: medicine.id,
      genericName: medicine.genericName,
      brandName: medicine.brandName,
      dosage: medicine.dosage,
      form: medicine.form,
      category: medicine.category,
      description: medicine.description,
      standardPrice: medicine.standardPrice,
      imageUrl: medicine.imageUrl,
      availability,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
}

export async function getPopularMedicines(_req: Request, res: Response): Promise<void> {
  try {
    const medicines = await prisma.medicine.findMany({
      take: 12,
      orderBy: { genericName: 'asc' },
      select: {
        id: true,
        genericName: true,
        brandName: true,
        dosage: true,
        form: true,
        category: true,
        imageUrl: true,
      },
    });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
}
