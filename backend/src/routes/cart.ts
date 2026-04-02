import { Router } from 'express';
import { addToCart, removeFromCart, getCart, checkoutCart, getHistory } from '../controllers/cartController';
import { optionalAuthenticate, authenticate } from '../middleware/auth';

const router = Router();

// Cart routes — sessionId required as fallback, but honors user token if present
router.use(optionalAuthenticate as any);

router.get('/', getCart as any);
router.get('/history', authenticate as any, getHistory as any);
router.post('/add', addToCart as any);
router.post('/checkout', checkoutCart as any);
router.delete('/:cartItemId', removeFromCart as any);

export default router;
