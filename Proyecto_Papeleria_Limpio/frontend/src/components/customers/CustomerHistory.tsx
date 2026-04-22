import { useState, useEffect } from 'react';
import { Customer, Sale } from '../../types';
import { customerApi } from '../../services/api';
import { X, ShoppingCart, Calendar, Clock, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerHistoryProps {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerHistory({ customer, onClose }: CustomerHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await customerApi.getSales(customer.id);
        setSales(data);
      } catch (error) {
        toast.error('Error al cargar el historial del cliente');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [customer.id]);

  const totalSpent = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-black">
                {customer.name.charAt(0)}
              </span>
              Historial de Compras
            </h2>
            <p className="text-sm text-slate-500 mt-1 pl-10">{customer.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-4 p-6 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Gastado</p>
              <p className="text-lg font-black text-slate-800">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Compras Totales</p>
              <p className="text-lg font-black text-slate-800">{sales.length}</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando historial...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Este cliente aún no tiene compras registradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="border border-slate-100 rounded-2xl p-4 hover:border-primary-200 transition-colors group bg-slate-50/50 hover:bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{sale.folio.slice(0, 8).toUpperCase()}
                        </span>
                        {sale.discount > 0 && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Con Descuento
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(sale.createdAt).toLocaleDateString('es-MX')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(sale.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-800">${sale.total.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{sale.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-slate-100 p-3 mt-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Artículos ({sale.items.length})</p>
                    <div className="space-y-2">
                      {sale.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-bold text-slate-600 bg-slate-50 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs">
                              {item.quantity}
                            </span>
                            <span className="text-slate-600 truncate">{item.product?.name || 'Producto Desconocido'}</span>
                          </div>
                          <span className="font-medium text-slate-500 shrink-0 ml-4">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
