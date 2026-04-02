import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './lib/socket';

dotenv.config();

import authRoutes from './routes/auth';
import medicineRoutes from './routes/medicines';
import pharmacyRoutes from './routes/pharmacies';
import adminRoutes from './routes/admin';
import cartRoutes from './routes/cart';
import { errorHandler, notFound } from './middleware/errorHandler';
import { cleanupExpiredReservations } from './controllers/cartController';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initSocket(httpServer);

// Security & performance middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://your-domain.com'] : true,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for development
  message: { error: 'Too many login attempts, try again in 15 minutes' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);

// 404 & Error handling
app.use('/uploads', express.static('public/uploads'));
app.use(notFound);
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 MediFind API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);

  // Background worker: clean up expired cart reservations every 60 seconds
  setInterval(async () => {
    try {
      const count = await cleanupExpiredReservations();
      if (count > 0) {
        console.log(`🧹 Cleaned up ${count} expired cart reservation(s)`);
      }
    } catch (err) {
      console.error('Reservation cleanup error:', err);
    }
  }, 60_000);
});

export default app;
