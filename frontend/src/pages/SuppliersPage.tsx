import { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Edit2, Trash2, Phone, Mail, 
  Loader2, X, Save, Building2, UserCircle
} from 'lucide-react';
import { supplierApi } from '../services/api';
import { Supplier } from '../types';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch (error) {
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setName(supplier.name);
      setContact(supplier.contact || '');
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setContact('');
      setPhone('');
      setEmail('');
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, { name, contact, phone, email });
        toast.success('Proveedor actualizado');
      } else {
        await supplierApi.create({ name, contact, phone, email });
        toast.success('Proveedor registrado');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Error al guardar proveedor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await supplierApi.delete(id);
      toast.success('Proveedor eliminado');
      fetchSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar proveedor');
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contact && s.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Proveedores</h1>
          <p className="text-slate-500 text-sm">Gestiona tus distribuidores y empresas aliadas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-200"
        >
          <Building2 className="w-5 h-5" />
          Nuevo Proveedor
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
              placeholder="Buscar por empresa o contacto..."
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
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Contacto Directo</th>
                  <th className="px-6 py-4">Datos Telefónicos/Email</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron proveedores
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                            <Briefcase className="w-5 h-5"/>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{supplier.name}</p>
                            <p className="text-xs text-slate-400">ID: #{supplier.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 text-sm text-slate-600">
                            <UserCircle className="w-4 h-4 text-slate-400" />
                            {supplier.contact || 'Sin Especificar'}
                         </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {supplier.phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {supplier.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(supplier)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Editar Proveedor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(supplier.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Eliminar Proveedor"
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
                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre de Empresa/Marca</label>
                <input
                  required
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Comercializadora Estrella"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre del Contacto Directo</label>
                <input
                  type="text"
                  className="input-field"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Ej. Roberto Sánchez (Opcional)"
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
                    placeholder="ventas@empresa.com"
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
    </div>
  );
}
