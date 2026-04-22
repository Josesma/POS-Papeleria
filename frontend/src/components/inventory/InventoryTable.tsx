import { useState } from 'react';
import { Edit3, Save, X, Package, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';
import { productApi } from '../../services/api';
import toast from 'react-hot-toast';

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

export default function InventoryTable({ products, loading, onRefresh }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditStock(product.stock);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStock(0);
  };

  const saveStock = async (productId: number) => {
    try {
      setSaving(true);
      await productApi.updateStock(productId, editStock);
      toast.success('Stock actualizado');
      setEditingId(null);
      onRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar stock';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-400">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                Categoría
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Código
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-slate-400 truncate">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="badge-blue">{product.category}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-slate-400 font-mono">
                    {product.barcode || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-semibold text-slate-800">
                    ${product.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-slate-500">
                    ${product.cost.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      min="0"
                      value={editStock}
                      onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                      className="input w-20 text-center py-1 text-sm mx-auto"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveStock(product.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      {product.stock <= (product.minStock || 5) && product.stock > 0 && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          product.stock <= 0
                            ? 'text-red-500'
                            : product.stock <= (product.minStock || 5)
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {editingId === product.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => saveStock(product.id)}
                        disabled={saving}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(product)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-primary-50 hover:text-primary-600 transition-colors mx-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
