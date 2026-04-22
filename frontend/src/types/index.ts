// Auth types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
}

// Customer types
export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

// Supplier types
export interface Supplier {
  id: number;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

// Purchase types
export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  quantity: number;
  unitCost: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    barcode: string | null;
  };
}

export interface Purchase {
  id: number;
  folio: string;
  supplierId: number;
  userId: number;
  totalCost: number;
  notes: string | null;
  items: PurchaseItem[];
  createdAt: string;
  supplier?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

export interface CreatePurchaseInput {
  supplierId: number;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitCost: number;
  }>;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string | null;
  barcode: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  minStock?: number;
  category: string;
  imageUrl?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

// Sale types
export interface SaleItem {
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productId: number;
  saleId: number;
  product: {
    id: number;
    name: string;
    barcode: string | null;
    category?: string;
  };
}

export interface Sale {
  id: number;
  folio: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  amountReceived: number | null;
  changeProduced: number | null;
  notes: string | null;
  customerId: number | null;
  userId: number | null;
  shiftId: number | null;
  items: SaleItem[];
  createdAt: string;
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
  shiftId: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    products?: T[];
    sales?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

