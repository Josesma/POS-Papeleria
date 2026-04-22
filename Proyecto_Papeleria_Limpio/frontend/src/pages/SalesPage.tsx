import { useSales } from '../hooks/useSales';
import SalesHistory from '../components/sales/SalesHistory';
import { DollarSign, ShoppingCart, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { exportSalesExcel } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const { sales, loading, page, setPage, totalPages } = useSales();

  // Stats from current page
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalSales = sales.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const handleExportExcel = async () => {
    try {
      await exportSalesExcel(sales);
      toast.success('Ventas exportadas a Excel');
    } catch (err) {
      toast.error('Error al exportar');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Historial de Ventas</h1>
          <p className="text-sm text-slate-400">Consulta y exporta tus transacciones</p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={sales.length === 0}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Exportar Excel
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalSales}</p>
            <p className="text-xs text-slate-400">Ventas Realizadas</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400">Ingresos Totales</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              ${avgTicket.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400">Ticket Promedio</p>
          </div>
        </div>
      </div>

      {/* Sales list */}
      <SalesHistory
        sales={sales}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
