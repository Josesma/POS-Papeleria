import { useState, useRef } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { productApi } from '../services/api';
import ProductSearch from '../components/pos/ProductSearch';
import ProductCard from '../components/pos/ProductCard';
import Cart from '../components/pos/Cart';
import CheckoutModal from '../components/pos/CheckoutModal';
import { Loader2, PackageSearch, Landmark, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useShiftStore } from '../store/shiftStore';
import ShiftModal from '../components/shifts/ShiftModal';

export default function POSPage() {
  const { products, categories, search, setSearch, category, setCategory, loading, refetch } =
    useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.itemCount);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { activeShift, initialized, loading: shiftLoading } = useShiftStore();

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onSearchFocus: () => searchInputRef.current?.focus(),
    onCheckout: () => setShowCheckout(true),
  });

  // Barcode integration
  useBarcodeScanner(async (barcode) => {
    try {
      const response = await productApi.getAll({ search: barcode });
      const product = response.products.find(p => p.barcode === barcode);
      
      if (product) {
        addItem(product);
        toast.success(`Agregado: ${product.name}`, { icon: '🏷️', id: 'barcode-scan' });
      } else {
        toast.error(`Producto no encontrado: ${barcode}`, { id: 'barcode-scan' });
      }
    } catch (err) {
      console.error('Error scanning barcode:', err);
    }
  });

  // If system is initializing shift state, show nothing yet to avoid flicker
  if (!initialized || shiftLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // MANDATORY SHIFT CHECK
  if (!activeShift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-slate-200 animate-fade-in">
        <div className="w-24 h-24 bg-primary-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-primary-100 rotate-6">
          <Landmark className="w-12 h-12 text-primary-600 -rotate-6" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Caja Cerrada</h1>
        <p className="text-slate-500 max-w-md mb-10 text-lg">
          Para comenzar a vender en esta terminal, necesitas abrir un turno y registrar el saldo inicial de efectivo.
        </p>
        <button
          onClick={() => setShowOpenShiftModal(true)}
          className="btn-primary h-16 px-10 rounded-2xl text-xl font-bold shadow-2xl shadow-primary-200 group"
        >
          <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          Abrir Punto de Venta
        </button>

        <ShiftModal 
          isOpen={showOpenShiftModal}
          onClose={() => setShowOpenShiftModal(false)}
          mode="OPEN"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Products panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <ProductSearch
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            selectedCategory={category}
            onCategoryChange={setCategory}
            inputRef={searchInputRef}
          />

          {/* Products grid */}
          <div className="flex-1 mt-4 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <PackageSearch className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">
                  {search
                    ? `No se encontraron resultados para "${search}"`
                    : 'No hay productos disponibles'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={addItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile cart toggle */}
          <div className="lg:hidden mt-4">
            <button
              onClick={() => setShowMobileCart(!showMobileCart)}
              className="btn-primary w-full"
            >
              {showMobileCart ? 'Ver Productos' : `Ver Carrito (${itemCount})`}
            </button>
          </div>
        </div>

        {/* Cart panel - Desktop */}
        <div className="hidden lg:flex w-96 flex-col card overflow-hidden flex-shrink-0">
          <Cart onCheckout={() => setShowCheckout(true)} />
        </div>
      </div>

      {/* Cart panel - Mobile */}
      {showMobileCart && (
        <div className="fixed inset-0 z-40 bg-white lg:hidden animate-slide-in">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Carrito</h3>
              <button
                onClick={() => setShowMobileCart(false)}
                className="btn-ghost text-sm"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Cart onCheckout={() => {
                setShowMobileCart(false);
                setShowCheckout(true);
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={refetch}
      />
    </>
  );
}
