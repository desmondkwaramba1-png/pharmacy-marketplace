import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { emitStockUpdate } from '../lib/socket';

const RESERVATION_MINUTES = 10;

function getSessionId(req: Request): string {
  const sid = req.headers['x-session-id'] as string;
  if (!sid) throw new Error('Missing x-session-id header');
  return sid;
}

/** Get or create a cart for this session/user */
async function getOrCreateCart(req: Request) {
  const sessionId = getSessionId(req);
  const userId = (req as any).user?.id;

  if (userId) {
    // Check if user already has a cart
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (cart) return cart;

    // See if an anonymous cart exists for this session and link it
    cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (cart) {
      return prisma.cart.update({
        where: { id: cart.id },
        data: { userId },
      });
    }

    // Create new cart for user
    return prisma.cart.create({
      data: { sessionId, userId },
    });
  }

  // Guest (Anonymous) mode
  return prisma.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
  });
}

/**
 * POST /api/cart/add
 * Body: { pharmacyId, medicineId, quantity? }
 */
export async function addToCart(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = getSessionId(req);
    const { pharmacyId, medicineId, quantity = 1 } = req.body;

    if (!pharmacyId || !medicineId) {
      res.status(400).json({ error: 'pharmacyId and medicineId are required' });
      return;
    }

    // Check inventory availability
    const inventory = await prisma.pharmacyInventory.findUnique({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
      include: { medicine: true, pharmacy: true },
    });

    if (!inventory) {
      res.status(404).json({ error: 'Item not found in inventory' });
      return;
    }

    const available = inventory.quantity - inventory.reservedQuantity;
    if (available < quantity) {
      res.status(409).json({ error: 'Not enough stock available', available });
      return;
    }

    const cart = await getOrCreateCart(req);
    const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

    // Upsert cart item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_pharmacyId_medicineId: { cartId: cart.id, pharmacyId, medicineId } },
    });

    if (existing && existing.status === 'reserved') {
      // Update quantity of existing reservation
      const additionalQty = quantity;
      if (available < additionalQty) {
        res.status(409).json({ error: 'Not enough stock available', available });
        return;
      }

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + additionalQty, expiresAt },
      });

      // Reserve additional stock
      await prisma.pharmacyInventory.update({
        where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
        data: { reservedQuantity: { increment: additionalQty } },
      });
    } else {
      // Create new cart item
      if (existing) {
        // Replace expired/checked-out item
        await prisma.cartItem.delete({ where: { id: existing.id } });
      }

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          pharmacyId,
          medicineId,
          quantity,
          expiresAt,
          status: 'reserved',
        },
      });

      // Reserve stock
      await prisma.pharmacyInventory.update({
        where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
        data: { reservedQuantity: { increment: quantity } },
      });
    }

    // Emit real-time update
    const updated = await prisma.pharmacyInventory.findUnique({
      where: { pharmacyId_medicineId: { pharmacyId, medicineId } },
    });
    if (updated) {
      emitStockUpdate(pharmacyId, medicineId, updated.quantity - updated.reservedQuantity, updated.stockStatus);
    }

    // Return full cart
    const fullCart = await getFullCart(req);
    res.json(fullCart);
  } catch (err: any) {
    console.error('addToCart error:', err);
    if (err.message === 'Missing x-session-id header') {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

/**
 * DELETE /api/cart/:cartItemId
 */
export async function removeFromCart(req: Request, res: Response): Promise<void> {
  try {
    const { cartItemId } = req.params;
    const cart = await getOrCreateCart(req);

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!item) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    // Restore reserved stock if item was still reserved
    if (item.status === 'reserved') {
      await prisma.pharmacyInventory.update({
        where: { pharmacyId_medicineId: { pharmacyId: item.pharmacyId, medicineId: item.medicineId } },
        data: { reservedQuantity: { decrement: item.quantity } },
      });

      // Emit real-time stock restored
      const updated = await prisma.pharmacyInventory.findUnique({
        where: { pharmacyId_medicineId: { pharmacyId: item.pharmacyId, medicineId: item.medicineId } },
      });
      if (updated) {
        emitStockUpdate(item.pharmacyId, item.medicineId, updated.quantity - updated.reservedQuantity, updated.stockStatus);
      }
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    const fullCart = await getFullCart(req);
    res.json(fullCart);
  } catch (err: any) {
    console.error('removeFromCart error:', err);
    if (err.message === 'Missing x-session-id header') {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
}

/**
 * GET /api/cart
 */
/**
 * GET /api/cart
 */
export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    const fullCart = await getFullCart(req);
    res.json(fullCart);
  } catch (err: any) {
    console.error('getCart error:', err);
    if (err.message === 'Missing x-session-id header') {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

/**
 * POST /api/cart/checkout
 */
export async function checkoutCart(req: Request, res: Response): Promise<void> {
  try {
    const cart = await getOrCreateCart(req);

    const cartWithItems = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          where: { status: 'reserved' },
        },
      },
    });

    if (!cartWithItems || cartWithItems.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty or items have expired' });
      return;
    }

    const bookingRef = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Process all items in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of cartWithItems.items) {
        // Mark as checked out
        await tx.cartItem.update({
          where: { id: item.id },
          data: { status: 'checked_out' },
        });

        // Deduct both quantity (it's sold) and reservedQuantity (it's no longer reserved)
        await tx.pharmacyInventory.update({
          where: { pharmacyId_medicineId: { pharmacyId: item.pharmacyId, medicineId: item.medicineId } },
          data: {
            quantity: { decrement: item.quantity },
            reservedQuantity: { decrement: item.quantity },
          },
        });
      }
    });

    res.json({ message: 'Checkout successful', bookingRef });
  } catch (err: any) {
    console.error('checkoutCart error:', err);
    if (err.message === 'Missing x-session-id header') {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Checkout failed' });
  }
}

/**
 * GET /api/cart/history
 * Requires authentication
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          where: { status: 'checked_out' },
          include: { medicine: true, pharmacy: true },
          orderBy: { reservedAt: 'desc' },
        },
      },
    });

    if (!cart) {
      res.json({ items: [] });
      return;
    }

    res.json({ items: (cart as any).items });
  } catch (err) {
    console.error('getHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}

/** Helper to get a fully populated cart */
async function getFullCart(req: Request) {
  const sessionId = getSessionId(req);
  const userId = (req as any).user?.id;

  const cart = await prisma.cart.findFirst({
    where: {
      OR: [
        { userId: userId || undefined },
        { sessionId }
      ]
    },
    include: {
      items: {
        where: { status: 'reserved' },
        orderBy: { reservedAt: 'desc' },
      },
    },
  });

  if (!cart || (cart as any).items.length === 0) {
    return { items: [], total: 0, itemCount: 0 };
  }

  // Enrich items with medicine + pharmacy info
  const enrichedItems = await Promise.all(
    cart.items.map(async (item) => {
      const inventory = await prisma.pharmacyInventory.findUnique({
        where: { pharmacyId_medicineId: { pharmacyId: item.pharmacyId, medicineId: item.medicineId } },
        include: { medicine: true, pharmacy: true },
      });

      const now = new Date();
      const remainingMs = item.expiresAt.getTime() - now.getTime();
      const isExpired = remainingMs <= 0;

      return {
        id: item.id,
        pharmacyId: item.pharmacyId,
        medicineId: item.medicineId,
        quantity: item.quantity,
        reservedAt: item.reservedAt.toISOString(),
        expiresAt: item.expiresAt.toISOString(),
        remainingSeconds: isExpired ? 0 : Math.ceil(remainingMs / 1000),
        isExpired,
        medicine: inventory?.medicine ?? null,
        pharmacy: inventory?.pharmacy ?? null,
        price: inventory?.price ?? null,
        lineTotal: inventory?.price ? inventory.price * item.quantity : null,
      };
    })
  );

  const total = enrichedItems.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
  const itemCount = enrichedItems.reduce((sum, i) => sum + i.quantity, 0);

  return { items: enrichedItems, total: Math.round(total * 100) / 100, itemCount };
}

/**
 * Clean up expired reservations — called by background worker
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const now = new Date();

  const expiredItems = await prisma.cartItem.findMany({
    where: { status: 'reserved', expiresAt: { lte: now } },
  });

  if (expiredItems.length === 0) return 0;

  for (const item of expiredItems) {
    try {
      // Restore the reserved stock
      await prisma.pharmacyInventory.update({
        where: {
          pharmacyId_medicineId: { pharmacyId: item.pharmacyId, medicineId: item.medicineId },
        },
        data: { reservedQuantity: { decrement: item.quantity } },
      });

      // Mark cart item as expired
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { status: 'expired' },
      });

      // Emit stock restored
      const updated = await prisma.pharmacyInventory.findUnique({
        where: {
          pharmacyId_medicineId: { pharmacyId: item.pharmacyId, medicineId: item.medicineId },
        },
      });
      if (updated) {
        emitStockUpdate(item.pharmacyId, item.medicineId, updated.quantity - updated.reservedQuantity, updated.stockStatus);
      }

      console.log(`⏰ Expired reservation: ${item.id} (medicine: ${item.medicineId})`);
    } catch (err) {
      console.error(`Failed to expire reservation ${item.id}:`, err);
    }
  }

  return expiredItems.length;
}
