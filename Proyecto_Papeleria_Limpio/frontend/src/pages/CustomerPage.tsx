import { useState, useEffect } from 'react';
import { 
  UserPlus, Search, Edit2, Trash2, Phone, Mail, 
  Loader2, X, Save, History
} from 'lucide-react';
import { customerApi } from '../services/api';
import { Customer } from '../types';
import toast from 'react-hot-toast';
import CustomerHistory from '../components/customers/CustomerHistory';

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Customer | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
    } else {
      setEditingCustomer(null);
      setName('');
      setPhone('');
      setEmail('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, { name, phone, email });
        toast.success('Cliente actualizado');
      } else {
        await customerApi.create({ name, phone, email });
        toast.success('Cliente registrado');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Error al guardar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await customerApi.delete(id);
      toast.success('Cliente eliminado');
      fetchCustomers();
    } catch (error) {
      toast.error('Error al eliminar cliente');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Directorio de Clientes</h1>
          <p className="text-slate-500 text-sm">Gestiona la base de datos de tus clientes</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <div className="relative group max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              className="input-field pl-11 py-3"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex justify-center">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Contacto</th>
                  <th className="px-6 py-4">Fecha Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{customer.name}</p>
                            <p className="text-xs text-slate-400">ID: #{customer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {customer.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {customer.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        Público General
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setViewingHistory(customer)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Ver Historial"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenModal(customer)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Editar Cliente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Eliminar Cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre Completo</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Teléfono</label>
                  <input
                    type="text"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="55-0000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                   type="submit"
                   className="btn-primary flex-1 gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      {viewingHistory && (
        <CustomerHistory 
          customer={viewingHistory} 
          onClose={() => setViewingHistory(null)} 
        />
      )}
    </div>
  );
}
