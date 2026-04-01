import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { haversineDistance, filterByRadius } from '../services/geoService';

export async function getNearbyPharmacies(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng, radius = '10', medicine } = req.query;

    if (!lat || !lng) {
      // Return all active pharmacies if no coords
      const pharmacies = await prisma.pharmacy.findMany({
        where: { isActive: true },
        select: {
          id: true, name: true, address: true, suburb: true,
          city: true, phone: true, latitude: true, longitude: true,
          operatingHours: true,
        },
      });
      res.json(pharmacies);
      return;
    }

    const userLat = parseFloat(String(lat));
    const userLng = parseFloat(String(lng));
    const radiusKm = parseFloat(String(radius));

    const pharmacies = await prisma.pharmacy.findMany({
      where: { isActive: true },
      include: medicine
        ? {
            inventory: {
              where: { medicine: { genericName: { contains: String(medicine), mode: 'insensitive' } as any } },
              include: { medicine: true },
            },
          }
        : undefined,
    });

    const nearby = filterByRadius(pharmacies, userLat, userLng, radiusKm).map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      suburb: p.suburb,
      city: p.city,
      phone: p.phone,
      latitude: p.latitude,
      longitude: p.longitude,
      distance: p.distance,
      operatingHours: p.operatingHours ? JSON.parse(p.operatingHours) : null,
      inventory: (p as any).inventory,
    }));

    res.json(nearby);
  } catch (err) {
    console.error('getNearbyPharmacies error:', err);
    res.status(500).json({ error: 'Failed to fetch pharmacies' });
  }
}

export async function getPharmacyById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        inventory: {
          where: { stockStatus: { not: 'out_of_stock' } },
          include: { medicine: true },
          orderBy: { lastUpdated: 'desc' },
          take: 20,
        },
      },
    });

    if (!pharmacy) {
      res.status(404).json({ error: 'Pharmacy not found' });
      return;
    }

    const distance =
      lat && lng
        ? haversineDistance(
            parseFloat(String(lat)),
            parseFloat(String(lng)),
            pharmacy.latitude,
            pharmacy.longitude
          )
        : null;

    res.json({
      ...pharmacy,
      operatingHours: pharmacy.operatingHours ? JSON.parse(pharmacy.operatingHours) : null,
      distance,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacy' });
  }
}
