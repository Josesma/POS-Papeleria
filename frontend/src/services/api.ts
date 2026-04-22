import { ApiResponse } from '../types';

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('pos_token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  // Handlers for unauthorized responses
  if (response.status === 401 && endpoint !== '/auth/login') {
    localStorage.removeItem('pos_token');
    window.location.href = '/login';
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    const errorMessage = data.error || `Error ${response.status}`;
    const error = new Error(errorMessage) as Error & {
      status: number;
      details: unknown;
    };
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data.data as T;
}

// ============ AUTH ============

export const authApi = {
  login: (data: any) => request<{ user: import('../types').User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => request<import('../types').User>('/auth/me'),
};

// ============ PRODUCTS ============

export const productApi = {
  getAll: (params?: { search?: string; category?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category) searchParams.set('category', params.category);
    const query = searchParams.toString();
    return request<{
      products: import('../types').Product[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/products${query ? `?${query}` : ''}`);
  },

  getById: (id: number) =>
    request<import('../types').Product>(`/products/${id}`),

  create: (data: import('../types').CreateProductInput) =>
    request<import('../types').Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: import('../types').UpdateProductInput) =>
    request<import('../types').Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStock: (id: number, stock: number) =>
    request<import('../types').Product>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    }),

  getCategories: () => request<string[]>('/products/categories'),
};

// ============ SALES ============

export const saleApi = {
  getAll: (params?: { page?: number; limit?: number; from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    const query = searchParams.toString();
    return request<{
      sales: import('../types').Sale[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/sales${query ? `?${query}` : ''}`);
  },

  getById: (id: number) =>
    request<import('../types').Sale>(`/sales/${id}`),

  getStats: () =>
    request<any>('/sales/stats'),

  create: (data: import('../types').CreateSaleInput) =>
    request<import('../types').Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============ CUSTOMERS ============

export const customerApi = {
  getAll: () => request<import('../types').Customer[]>('/customers'),
  search: (term: string) => request<import('../types').Customer[]>(`/customers/search?term=${term}`),
  create: (data: any) => request<import('../types').Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<import('../types').Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/customers/${id}`, {
    method: 'DELETE',
  }),
  getSales: (id: number) => request<import('../types').Sale[]>(`/customers/${id}/sales`),
};

// ============ SHIFTS ============

export const shiftApi = {
  getActive: () => request<any>('/shifts/active'),
  open: (initialBalance: number) => request<any>('/shifts/open', {
    method: 'POST',
    body: JSON.stringify({ initialBalance }),
  }),
  close: (id: number, actualBalance: number) => request<any>(`/shifts/${id}/close`, {
    method: 'POST',
    body: JSON.stringify({ actualBalance }),
  }),
};

// ============ SUPPLIERS ============

export const supplierApi = {
  getAll: () => request<import('../types').Supplier[]>('/suppliers'),
  search: (term: string) => request<import('../types').Supplier[]>(`/suppliers/search?q=${term}`),
  create: (data: any) => request<import('../types').Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<import('../types').Supplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/suppliers/${id}`, {
    method: 'DELETE',
  }),
};

// ============ PURCHASES ============

export const purchaseApi = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return request<{
      purchases: import('../types').Purchase[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>(`/purchases${query ? `?${query}` : ''}`);
  },

  getById: (id: number) =>
    request<import('../types').Purchase>(`/purchases/${id}`),

  create: (data: import('../types').CreatePurchaseInput) =>
    request<import('../types').Purchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
