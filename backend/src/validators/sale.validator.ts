import { z } from 'zod';

export const saleItemSchema = z.object({
  productId: z.number().int().positive('ID de producto inválido'),
  quantity: z
    .number()
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor a 0'),
});

export const createSaleSchema = z.object({
  items: z
    .array(saleItemSchema)
    .min(1, 'La venta debe tener al menos un producto'),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']).optional(),
  amountReceived: z.number().nonnegative().optional(),
  changeProduced: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  customerId: z.number().int().positive().optional(),
  shiftId: z.number().int().positive(),
});

export const saleQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  from: z.string().optional(), // Relaxed to allow ISO strings
  to: z.string().optional(),
});
