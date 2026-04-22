import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
