import { ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import CartItemComponent from './CartItem';

interface CartProps {
  onCheckout: () => void;
}

export default function Cart({ onCheckout }: CartProps) {
  const { items, subtotal, tax, total, itemCount, removeItem, updateQuantity, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="font-semibold text-slate-600 mb-1">Carrito vacío</h3>
        <p className="text-sm text-slate-400">
          Agrega productos para comenzar una venta
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-slate-800">
            Carrito
            <span className="ml-1.5 text-xs font-normal text-slate-400">
              ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})
            </span>
          </h3>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.map((item) => (
          <CartItemComponent
            key={item.product.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-slate-200 p-4 space-y-2 bg-white">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>IVA (16%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-800 pt-2 border-t border-slate-100">
          <span>Total</span>
          <span className="text-primary-600">${total.toFixed(2)}</span>
        </div>

        <button
          onClick={onCheckout}
          className="btn-primary w-full mt-3 text-base py-3"
          id="checkout-btn"
        >
          <CreditCard className="w-5 h-5" />
          Cobrar ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
