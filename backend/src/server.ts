import express from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import supplierRoutes from './routes/supplier.routes';
import purchaseRoutes from './routes/purchase.routes';
import shiftRoutes from './routes/shift.routes';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/sales', authMiddleware, saleRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/suppliers', supplierRoutes); // Protected inside file
app.use('/api/purchases', purchaseRoutes); // Protected inside file
app.use('/api/shifts', shiftRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('  🏪 POS Papelería - Backend');
  console.log(`  📡 Server running on http://localhost:${PORT}`);
  console.log(`  🔗 API: http://localhost:${PORT}/api`);
  console.log('');
});

export default app;
