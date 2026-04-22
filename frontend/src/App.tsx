import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomerPage from './pages/CustomerPage';
import SuppliersPage from './pages/SuppliersPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FFFFFF',
            color: '#1E293B',
            border: '1px solid #E2E8F0',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<POSPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/inventario" element={<InventoryPage />} />
                  <Route path="/ventas" element={<SalesPage />} />
                  <Route path="/clientes" element={<CustomerPage />} />
                  <Route path="/proveedores" element={<SuppliersPage />} />
                </Routes>
              </Layout>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
