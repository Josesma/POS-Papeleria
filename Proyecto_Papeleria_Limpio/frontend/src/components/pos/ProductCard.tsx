import { Plus, AlertCircle } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function getStockBadge(stock: number) {
  if (stock <= 0) return { className: 'badge-red', label: 'Agotado' };
  if (stock <= 10) return { className: 'badge-yellow', label: `${stock} pzas` };
  return { className: 'badge-green', label: `${stock} pzas` };
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const stockBadge = getStockBadge(product.stock);
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className={`card-hover p-4 flex flex-col gap-3 group ${
        isOutOfStock ? 'opacity-60' : 'cursor-pointer'
      }`}
      onClick={() => !isOutOfStock && onAdd(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isOutOfStock) {
          e.preventDefault();
          onAdd(product);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-800 truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {product.description}
            </p>
          )}
        </div>
        <span className={stockBadge.className}>{stockBadge.label}</span>
      </div>

      {/* Category */}
      <div className="flex items-center gap-2">
        <span className="badge-blue">{product.category}</span>
        {product.barcode && (
          <span className="text-[10px] text-slate-400 font-mono">
            {product.barcode}
          </span>
        )}
      </div>

      {/* Price + Add */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <span className="text-lg font-bold text-primary-600">
          ${product.price.toFixed(2)}
        </span>
        {isOutOfStock ? (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="w-3.5 h-3.5" />
            Sin stock
          </span>
        ) : (
          <button
            className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center
                       group-hover:bg-primary-600 group-hover:text-white transition-all duration-200
                       hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
