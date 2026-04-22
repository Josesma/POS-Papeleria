import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, ShoppingBag, Loader2, Printer, DollarSign, CreditCard, Landmark, Search, User as UserIcon, Tag, MessageSquare } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useShiftStore } from '../../store/shiftStore';
import { saleApi, customerApi } from '../../services/api';
import { Customer } from '../../types';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { items, total: cartTotal, clearCart } = useCartStore();
  const { activeShift } = useShiftStore();
  
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saleId, setSaleId] = useState<string | null>(null);
  const [saleTotal, setSaleTotal] = useState<number>(0);
  
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [change, setChange] = useState<number>(0);
  
  const [discount, setDiscount] = useState<string>('');
  const [notes, setNotes] = useState('');
  
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Calculate total with discount
  const discountVal = parseFloat(discount) || 0;
  const total = Math.max(0, cartTotal - discountVal);

  // Calculate change in real-time
  const handleAmountChange = useCallback((val: string) => {
    setAmountReceived(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setChange(Math.max(0, num - total));
    } else {
      setChange(0);
    }
  }, [total]);

  // Recalculate change if total changes (due to discount)
  useEffect(() => {
    const num = parseFloat(amountReceived);
    if (!isNaN(num)) {
      setChange(Math.max(0, num - total));
    }
  }, [total, amountReceived]);

  // Customer Search Logic — hooks must be BEFORE any early return
  useEffect(() => {
    if (!isOpen) return; // guard inside the hook, not before it
    if (customerSearch.length < 2) {
      setCustomers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await customerApi.search(customerSearch);
        setCustomers(res);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentMethod('CASH');
      setAmountReceived('');
      setChange(0);
      setDiscount('');
      setNotes('');
      setCustomerId(null);
      setCustomerSearch('');
      setCustomers([]);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!activeShift) {
      return toast.error('No hay un turno activo para realizar la venta');
    }

    if (paymentMethod === 'CASH') {
      const received = parseFloat(amountReceived);
      if (isNaN(received) || received < total) {
        return toast.error('El monto recibido es insuficiente');
      }
    }

    try {
      setLoading(true);
      const saleData = {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        amountReceived: parseFloat(amountReceived) || total,
        changeProduced: change,
        discount: parseFloat(discount) || 0,
        notes: notes || undefined,
        customerId: customerId || undefined,
        shiftId: activeShift.id,
      };

      const sale = await saleApi.create(saleData);
      setSaleId(sale.folio);
      setSaleTotal(sale.total);
      setCompleted(true);
      clearCart();
      toast.success('¡Venta registrada exitosamente!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar la venta';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    const wasCompleted = completed;
    setCompleted(false);
    setSaleId(null);
    setSaleTotal(0);
    onClose();
    if (wasCompleted) onSuccess();
  };

  // Early return AFTER all hooks have been called
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={!loading ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {completed ? '¡Venta completada!' : 'Confirmar Venta'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="btn-ghost p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              ¡Venta registrada!
            </h3>
            <p className="text-sm text-slate-500 mb-1">
              Total cobrado: <span className="font-bold text-primary-600">${saleTotal.toFixed(2)}</span>
            </p>
            {saleId && (
              <p className="text-xs text-slate-400 font-mono">
                Folio: {saleId.slice(0, 8).toUpperCase()}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrint}
                className="btn-secondary flex-1 font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Ticket
              </button>
              <button
                onClick={handleClose}
                className="btn-primary flex-1 font-bold"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation state */
          <>
            {/* Items summary */}
            <div className="px-6 py-4 max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0 text-slate-600">
                      <span className="truncate block font-medium">
                        {item.product.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-800 ml-4">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Selection */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Cliente (Opcional)
              </p>
              {!customerId ? (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Buscar por nombre o teléfono..."
                  />

                  {customers.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-40 overflow-y-auto">
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCustomerId(c.id);
                            setCustomerSearch(c.name);
                            setCustomers([]);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          <p className="font-bold text-slate-700">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.phone || 'Sin teléfono'}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white border border-primary-100 p-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{customerSearch}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCustomerId(null);
                      setCustomerSearch('');
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Método de Pago
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Efectivo</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Tarjeta</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    paymentMethod === 'TRANSFER'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Transf.</span>
                </button>
              </div>

              {/* Discount & Notes */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Tag className="w-3 h-3" /> Descuento ($)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <MessageSquare className="w-3 h-3" /> Notas
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Ej: Promo"
                  />
                </div>
              </div>

              {paymentMethod === 'CASH' && (
                <div className="space-y-4 animate-slide-up pt-2 border-t border-slate-50">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Recibido
                      </label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          autoFocus
                          type="number"
                          value={amountReceived}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="w-full pl-7 py-3 bg-slate-50 rounded-xl font-bold text-slate-700 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Cambio
                      </label>
                      <div className="mt-1 py-3 px-3 bg-emerald-50 rounded-xl font-bold text-emerald-600 text-lg border border-emerald-100">
                        ${change.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-1 bg-slate-50/50">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal (con IVA)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-xs text-rose-500 font-bold">
                  <span>Descuento aplicado</span>
                  <span>-${discountVal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-dashed border-slate-200 mt-2">
                <span>Total a Cobrar</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex gap-3 bg-white">
              <button
                onClick={handleClose}
                disabled={loading}
                className="btn-secondary flex-1 font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-success flex-1 font-bold shadow-lg shadow-emerald-100"
                id="confirm-sale-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                {loading ? 'Procesando...' : 'Cobrar'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Printable Ticket (Hidden, only for thermal printer) */}
      <div className="hidden print:block">
        <div id="printable-ticket" className="p-4 w-[58mm] text-[10px] font-mono leading-tight">
          <div className="text-center font-bold text-sm mb-2">PAPELERÍA POS</div>
          <div className="border-b border-dashed mb-2 pb-2">
            Folio: {saleId?.toUpperCase()}<br />
            Fecha: {new Date().toLocaleString('es-MX')}<br />
          </div>
          <div className="mb-2">
            {items.map(it => (
              <div key={it.product.id} className="flex justify-between">
                <span>{it.quantity} x {it.product.name.slice(0, 15)}</span>
                <span>${(it.quantity * it.product.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed pt-2">
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[8px] text-slate-500">
              <span>Pago: ({paymentMethod})</span>
              <span>${amountReceived || total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[8px] text-slate-500">
              <span>Cambio:</span>
              <span>${change.toFixed(2)}</span>
            </div>
          </div>
          <div className="text-center mt-4">¡Gracias por su compra!</div>
        </div>
      </div>
    </div>
  );
}
