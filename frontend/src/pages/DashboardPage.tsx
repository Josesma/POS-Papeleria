import { useState, useEffect } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  AlertTriangle, TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, 
  Calendar, Loader2, RefreshCw 
} from 'lucide-react';
import { saleApi, productApi } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [stats, prodResult] = await Promise.all([
        saleApi.getStats(),
        productApi.getAll() // No limit prop in the type
      ]);
      setData(stats);
      setProducts(prodResult.products);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 5));
  const lowStockCount = lowStockProducts.length;

  if (loading && !data) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const { summary, dailyData, categoryData } = data || { 
    summary: { totalRevenue: 0, totalSalesCount: 0, avgTicket: 0 },
    dailyData: [],
    categoryData: []
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
          <p className="text-slate-500 text-sm">Resumen de actividad de los últimos 7 días</p>
        </div>
        <button 
          onClick={fetchStats}
          className="btn-ghost flex items-center gap-2 text-primary-600 font-bold bg-primary-50 hover:bg-primary-100"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 overflow-hidden relative">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas (7d)</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">${summary.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 overflow-hidden relative">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transacciones</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{summary.totalSalesCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6 overflow-hidden relative">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Avg</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">${summary.avgTicket.toFixed(1)}</h3>
          </div>
        </div>

        <div className={`rounded-3xl p-6 shadow-sm border flex items-center gap-6 overflow-hidden relative transition-all ${
          lowStockCount > 0 
            ? 'bg-amber-50 border-amber-200 animate-pulse-subtle' 
            : 'bg-white border-slate-100'
        }`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            lowStockCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Crítico</p>
            <h3 className={`text-2xl font-black mt-1 ${
              lowStockCount > 0 ? 'text-amber-700' : 'text-slate-800'
            }`}>
              {lowStockCount}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Ingresos Diarios</h3>
              <p className="text-sm text-slate-400">Tendencia de los últimos 7 días</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  dy={10}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString('es-MX', { weekday: 'short' });
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: unknown) => {
                    const numVal = typeof val === 'number' ? val : 0;
                    return [`$${numVal.toFixed(2)}`, 'Ventas'];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 uppercase tracking-tight">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Ventas por Categoría</h3>
              <p className="text-sm text-slate-400">Distribución de ingresos</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: unknown) => {
                    const numVal = typeof val === 'number' ? val : 0;
                    return [`$${numVal.toFixed(2)}`, 'Revenue'];
                  }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
