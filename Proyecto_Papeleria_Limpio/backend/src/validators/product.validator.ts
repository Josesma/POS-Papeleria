import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().max(500).optional(),
  barcode: z.string().max(50).optional(),
  price: z
    .number()
    .positive('El precio debe ser mayor a 0')
    .max(999999, 'El precio no puede exceder $999,999'),
  cost: z.number().min(0, 'El costo no puede ser negativo').optional(),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').optional(),
  category: z.string().max(50).optional(),
  imageUrl: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const updateStockSchema = z.object({
  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});
