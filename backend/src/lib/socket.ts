import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? ['https://your-domain.com'] : true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

export function emitStockUpdate(pharmacyId: string, medicineId: string, newStock: number, status: string) {
  if (io) {
    io.emit('stockUpdated', { pharmacyId, medicineId, newStock, status });
    console.log(`📡 Emitted stock update for medicine ${medicineId} at pharmacy ${pharmacyId}`);
  }
}
