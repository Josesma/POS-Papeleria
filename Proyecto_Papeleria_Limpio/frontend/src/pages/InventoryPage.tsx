import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import InventoryTable from '../components/inventory/InventoryTable';
import ProductForm from '../components/inventory/ProductForm';
import ProductSearch from '../components/pos/ProductSearch';
import { Package, AlertTriangle, TrendingUp, FileSpreadsheet, FileText, PackagePlus } from 'lucide-react';
import { exportInventoryExcel, exportInventoryPDF } from '../utils/exportUtils';
import RegisterPurchaseModal from '../components/inventory/RegisterPurchaseModal';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const { products, categories, search, setSearch, category, setCategory, loading, refetch } =
    useProducts();

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Stats
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= (p.minStock || 5)).length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  const handleExportExcel = async () => {
    try {
      await exportInventoryExcel(products);
      toast.success('Inventario exportado a Excel');
    } catch (err) {
      toast.error('Error al exportar');
      console.error(err);
    }
  };

  const handleExportPDF = () => {
    try {
      exportInventoryPDF(products);
      toast.success('Inventario exportado a PDF');
    } catch (err) {
      toast.error('Error al exportar');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalProducts}</p>
            <p className="text-xs text-slate-400">Total de Productos</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{lowStock}</p>
            <p className="text-xs text-slate-400">Stock Bajo</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              ${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400">Valor en Inventario</p>
          </div>
        </div>
      </div>

      {/* Search + Export + Add */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="flex-1 w-full">
          <ProductSearch
            search={search}
            onSearchChange={setSearch}
            categories={categories}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Exportar a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Exportar a PDF"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            PDF
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <PackagePlus className="w-4 h-4" />
            Registrar Entrada
          </button>
          <ProductForm onSuccess={refetch} />
        </div>
      </div>

      {/* Table */}
      <InventoryTable
        products={products}
        loading={loading}
        onRefresh={refetch}
      />

      {showPurchaseModal && (
        <RegisterPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
