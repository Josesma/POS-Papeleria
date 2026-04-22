import { useState } from 'react';
import { ChevronDown, ChevronUp, Receipt, Calendar, Hash } from 'lucide-react';
import { Sale } from '../../types';

interface SalesHistoryProps {
  sales: Sale[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SalesHistory({
  sales,
  loading,
  page,
  totalPages,
  onPageChange,
}: SalesHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-400">Cargando ventas...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-600 mb-1">Sin ventas registradas</h3>
        <p className="text-sm text-slate-400">
          Las ventas aparecerán aquí cuando se realicen cobros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => {
        const isExpanded = expandedId === sale.id;
        return (
          <div key={sale.id} className="card overflow-hidden">
            {/* Sale header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : sale.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-800">
                      Venta #{sale.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      {sale.folio.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(sale.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {sale.items.length} {sale.items.length === 1 ? 'artículo' : 'artículos'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary-600">
                  ${sale.total.toFixed(2)}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Sale detail */}
            {isExpanded && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="bg-slate-50 rounded-xl p-4">
                  {/* Items table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b border-slate-200">
                        <th className="text-left pb-2">Producto</th>
                        <th className="text-center pb-2">Cant.</th>
                        <th className="text-right pb-2">P. Unit.</th>
                        <th className="text-right pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sale.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 text-slate-700">
                            {item.product.name}
                          </td>
                          <td className="py-2 text-center text-slate-600">
                            {item.quantity}
                          </td>
                          <td className="py-2 text-right text-slate-600">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-2 text-right font-medium text-slate-800">
                            ${item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span>
                      <span>${sale.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>IVA (16%)</span>
                      <span>${sale.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-800 pt-1">
                      <span>Total</span>
                      <span className="text-primary-600">
                        ${sale.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="btn-secondary text-sm py-2 px-3"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="btn-secondary text-sm py-2 px-3"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
