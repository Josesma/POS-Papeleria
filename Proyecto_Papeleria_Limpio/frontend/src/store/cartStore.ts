import { create } from 'zustand';
import { CartItem, Product } from '../types';

const TAX_RATE = 0.16; // IVA 16%

interface CartState {
  items: CartItem[];
  // Computed
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const tax = Math.round(roundedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((roundedSubtotal + tax) * 100) / 100;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return { subtotal: roundedSubtotal, tax, total, itemCount };
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  total: 0,
  itemCount: 0,

  addItem: (product: Product) =>
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingIndex >= 0) {
        // Increment quantity if already in cart (respect stock)
        newItems = state.items.map((item, index) => {
          if (index === existingIndex) {
            const newQty = Math.min(item.quantity + 1, product.stock);
            return { ...item, quantity: newQty };
          }
          return item;
        });
      } else {
        // Add new item
        if (product.stock <= 0) return state;
        newItems = [...state.items, { product, quantity: 1 }];
      }

      return { items: newItems, ...calculateTotals(newItems) };
    }),

  removeItem: (productId: number) =>
    set((state) => {
      const newItems = state.items.filter(
        (item) => item.product.id !== productId
      );
      return { items: newItems, ...calculateTotals(newItems) };
    }),

  updateQuantity: (productId: number, quantity: number) =>
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter(
          (item) => item.product.id !== productId
        );
        return { items: newItems, ...calculateTotals(newItems) };
      }

      const newItems = state.items.map((item) => {
        if (item.product.id === productId) {
          const clampedQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      });

      return { items: newItems, ...calculateTotals(newItems) };
    }),

  clearCart: () =>
    set({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
    }),
}));
