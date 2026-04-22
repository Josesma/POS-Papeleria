import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { ShoppingBag, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Por favor ingresa todos los campos');
    }

    try {
      setLoading(true);
      const { user, token } = await authApi.login({ email, password });
      login(user, token);
      toast.success(`¡Bienvenido, ${user.name}!`);
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-scale-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4 transition-transform hover:scale-110 duration-300">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">POS Papelería</h1>
          <p className="text-slate-500 mt-2">Inicia sesión para gestionar tu tienda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11 h-12 text-base"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 h-12 text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 text-lg font-bold shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400">
              © 2026 POS Papelería v2.0 • Sistema de Gestión Profesional
            </p>
            <div className="mt-2 space-x-4">
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                Admin: admin@papeleria.com / admin123
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
