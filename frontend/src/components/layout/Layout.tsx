import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, Store, Menu, X, LogOut, User as UserIcon, Layout as LayoutIcon, Users, Lock, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useShiftStore } from '../../store/shiftStore';
import ShiftModal from '../shifts/ShiftModal';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutIcon },
  { name: 'Punto de Venta', href: '/', icon: ShoppingCart },
  { name: 'Inventario', href: '/inventario', icon: Package },
  { name: 'Ventas', href: '/ventas', icon: BarChart3 },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Proveedores', href: '/proveedores', icon: Building2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.itemCount);
  const { user, logout } = useAuthStore();
  const { activeShift, fetchActiveShift, initialized } = useShiftStore();

  useEffect(() => {
    if (user && !initialized) {
      fetchActiveShift();
    }
  }, [user, initialized, fetchActiveShift]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 
                     transform transition-transform duration-300 ease-out
                     lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">POS</h1>
            <p className="text-xs text-slate-400 -mt-0.5">Papelería</p>
          </div>
          <button
            className="btn-ghost p-2 ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                {item.name}
                {item.href === '/' && itemCount > 0 && (
                  <span className="ml-auto bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {itemCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100">
          <div className="p-4">
            {user && (
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role}</p>
                </div>
              </div>
            )}
            
            {activeShift && (
              <button
                onClick={() => setShowShiftModal(true)}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors mb-1"
              >
                <Lock className="w-5 h-5" />
                Realizar Corte (Cerrar)
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
            
            <p className="text-[10px] text-slate-300 text-center mt-4">
              POS Papelería v3.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
          <div className="flex items-center gap-4 px-4 lg:px-8 h-16">
            <button
              className="btn-ghost p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800">
              {navigation.find((n) => n.href === location.pathname)?.name || 'POS Papelería'}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Shift Modal */}
      <ShiftModal 
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        mode="CLOSE"
      />
    </div>
  );
}
