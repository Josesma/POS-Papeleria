import { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Package, Plus, Trash2, Building2, Save, ShoppingCart, Loader2 } from 'lucide-react';
import { supplierApi, productApi, purchaseApi } from '../../services/api';
import { Supplier, Product } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PurchaseLineItem {
  product: Product;
  quantity: number;
  unitCost: number;
}

export default function RegisterPurchaseModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Supplier selection
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Product selection
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  
  // Purchase list
  const [items, setItems] = useState<PurchaseLineItem[]>([]);
  const [notes, setNotes] = useState('');

  const totalCost = items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

  // Supplier search effect
  useEffect(() => {
    if (!isOpen) return;
    if (supplierSearch.length < 2) {
      setSuppliers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await supplierApi.search(supplierSearch);
        setSuppliers(res);
      } catch (err) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [supplierSearch, isOpen]);

  // Product search effect
  useEffect(() => {
    if (!isOpen) return;
    if (productSearch.length < 2) {
      setProducts([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await productApi.getAll({ search: productSearch });
        setProducts(res.products);
      } catch (err) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, isOpen]);

  // Reset state when strictly opening
  useEffect(() => {
    if (isOpen) {
      setCompleted(false);
      setSupplierId(null);
      setSupplierSearch('');
      setItems([]);
      setNotes('');
      setProductSearch('');
    }
  }, [isOpen]);

  const handleAddProduct = (product: Product) => {
    const exists = items.find(i => i.product.id === product.id);
    if (exists) {
      setItems(items.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { product, quantity: 1, unitCost: product.cost || 0 }]);
    }
    setProductSearch('');
    setProducts([]);
  };

  const updateItem = (productId: number, field: 'quantity' | 'unitCost', value: string) => {
    const num = parseFloat(value) || 0;
    setItems(items.map(i => i.product.id === productId ? { ...i, [field]: num } : i));
  };

  const removeItem = (productId: number) => {
    setItems(items.filter(i => i.product.id !== productId));
  };

  const handleConfirm = async () => {
    if (!supplierId) return toast.error('Debes seleccionar un proveedor');
    if (items.length === 0) return toast.error('Debes añadir al menos un artículo');
    if (items.some(i => i.quantity <= 0)) return toast.error('Todas las cantidades deben ser mayores a cero');

    try {
      setLoading(true);
      await purchaseApi.create({
        supplierId,
        notes: notes || undefined,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitCost: i.unitCost
        }))
      });
      setCompleted(true);
      toast.success('Entrada de almacén registrada con éxito');
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la entrada');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={!loading ? onClose : undefined} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {completed ? 'Entrada Registrada' : 'Registrar Entrada de Mercancía'}
              </h2>
              <p className="text-xs text-slate-500">Incrementa el stock con productos del proveedor</p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-50 rounded-xl">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {completed ? (
          <div className="p-12 text-center flex-1 overflow-y-auto">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Inventario Actualizado!</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              La mercancía ha sido ingresada al almacén y los costos promedio han sido actualizados exitosamente.
            </p>
            <button
               onClick={() => { onClose(); onSuccess(); }}
               className="btn-primary"
            >
              Cerrar y ver inventario
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Supplier Search */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Proveedor Asociado
                </label>
                {!supplierId ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="input-field pl-10 bg-white"
                      placeholder="Busca por empresa o contacto..."
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                    />
                    {suppliers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-10 max-h-48 overflow-y-auto">
                        {suppliers.map(s => (
                          <button key={s.id} onClick={() => { setSupplierId(s.id); setSupplierSearch(s.name); setSuppliers([]); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 font-medium text-sm text-slate-700">
                            {s.name} <span className="text-slate-400 ml-2 font-normal">{s.contact}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white border border-indigo-100 p-3 rounded-xl">
                    <span className="font-bold text-slate-700">{supplierSearch}</span>
                    <button onClick={() => { setSupplierId(null); setSupplierSearch(''); }} className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Artículos a ingresar
                </label>
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="input-field pl-10"
                      placeholder="Busca artículo por nombre o código de barras..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    {products.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-10 max-h-48 overflow-y-auto">
                        {products.map(p => (
                          <button key={p.id} onClick={() => handleAddProduct(p)} className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-slate-50 border-b border-slate-50">
                            <div>
                               <p className="font-bold text-sm text-slate-700">{p.name}</p>
                               <p className="text-[10px] text-slate-400">Stock actual: {p.stock}</p>
                            </div>
                            <Plus className="w-4 h-4 text-primary-500" />
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3 w-28 text-center">Cant. Ingresa</th>
                        <th className="px-4 py-3 w-32 text-center">Costo Unit.</th>
                        <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                        <th className="px-4 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Agrega productos a la lista usando el buscador de arriba</td></tr>
                      ) : items.map((item) => (
                        <tr key={item.product.id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-700">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400">Stock post-entrada: <span className="font-bold text-emerald-500">{item.product.stock + item.quantity}</span></p>
                          </td>
                          <td className="px-4 py-3 px-2">
                             <input type="number" min="1" className="input-field text-center py-1.5 focus:ring-1" value={item.quantity || ''} onChange={(e) => updateItem(item.product.id, 'quantity', e.target.value)} />
                          </td>
                          <td className="px-4 py-3 px-2 relative">
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                             <input type="number" min="0" step="0.01" className="input-field text-right py-1.5 pl-6 focus:ring-1" value={item.unitCost || ''} onChange={(e) => updateItem(item.product.id, 'unitCost', e.target.value)} />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-700">
                            ${(item.quantity * item.unitCost).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => removeItem(item.product.id)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <div className="flex-1 mr-6">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Notas al pedido</label>
                        <input type="text" className="w-full bg-transparent border-none text-sm p-0 focus:ring-0 text-slate-700 placeholder:text-slate-300" placeholder="Ej. Factura #12345" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Costo Total Compra</p>
                       <p className="text-2xl font-black text-slate-800">${totalCost.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>
                </div>

              </div>

            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex gap-4">
              <button disabled={loading} onClick={onClose} className="btn-secondary flex-1 font-bold">
                Cancelar
              </button>
              <button disabled={loading || items.length === 0 || !supplierId} onClick={handleConfirm} className="btn-primary flex-1 font-bold flex gap-2 justify-center shadow-lg shadow-primary-200">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Procesando...' : 'Confirmar Entrada Stock'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
