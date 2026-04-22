import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

// Product types
export interface CreateProductInput {
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

export interface UpdateStockInput {
  stock: number;
}

// Sale types
export interface SaleItemInput {
  productId: number;
  quantity: number;
}

export interface CreateSaleInput {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  paymentMethod?: string;
  amountReceived?: number;
  changeProduced?: number;
  discount?: number;
  notes?: string;
  customerId?: number;
  shiftId?: number;
}

// Query params
export interface ProductQueryParams {
  search?: string;
  category?: string;
  page?: string;
  limit?: string;
}

export interface SaleQueryParams {
  page?: string;
  limit?: string;
  from?: string;
  to?: string;
}

// Express handler type
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
