import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item;
  const itemTotal = Math.round(product.price * quantity * 100) / 100;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 animate-scale-in">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-slate-800 truncate">
          {product.name}
        </h4>
        <p className="text-xs text-slate-400">
          ${product.price.toFixed(2)} c/u
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center
                     hover:bg-slate-200 active:scale-95 transition-all"
        >
          <Minus className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-slate-800">
          {quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          disabled={quantity >= product.stock}
          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center
                     hover:bg-slate-200 active:scale-95 transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>

      {/* Total + Delete */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-800 w-20 text-right">
          ${itemTotal.toFixed(2)}
        </span>
        <button
          onClick={() => onRemove(product.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     text-slate-400 hover:text-red-500 hover:bg-red-50
                     active:scale-95 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
