import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { CreateProductInput } from '../../types';
import { productApi } from '../../services/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onSuccess: () => void;
}

const initialForm: CreateProductInput = {
  name: '',
  description: '',
  barcode: '',
  price: 0,
  cost: 0,
  stock: 0,
  category: 'General',
};

const categoryOptions = [
  'General',
  'Escritura',
  'Cuadernos',
  'Papel',
  'Organización',
  'Herramientas',
  'Arte',
  'Tecnología',
  'Mochilas',
];

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CreateProductInput>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) {
      toast.error('Nombre y precio son requeridos');
      return;
    }

    try {
      setLoading(true);
      await productApi.create(form);
      toast.success(`Producto "${form.name}" creado`);
      setForm(initialForm);
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear producto';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreateProductInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
        id="add-product-btn"
      >
        <Plus className="w-4 h-4" />
        Nuevo Producto
      </button>
    );
  }

  return (
    <div className="card p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Nuevo Producto</h3>
        <button onClick={() => setIsOpen(false)} className="btn-ghost p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="input"
              placeholder="Ej: Lápiz HB No.2"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={form.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              className="input"
              placeholder="Descripción breve del producto"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Código de Barras
            </label>
            <input
              type="text"
              value={form.barcode || ''}
              onChange={(e) => updateField('barcode', e.target.value)}
              className="input"
              placeholder="Ej: 7501001001"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Categoría
            </label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="input"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Precio de Venta *
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.price || ''}
              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
              className="input"
              placeholder="0.00"
              required
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Costo
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cost || ''}
              onChange={(e) => updateField('cost', parseFloat(e.target.value) || 0)}
              className="input"
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stock Inicial
            </label>
            <input
              type="number"
              min="0"
              value={form.stock || ''}
              onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
              className="input"
              placeholder="0"
            />
          </div>

          {/* Min Stock */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Stock Mínimo (Alerta)
            </label>
            <input
              type="number"
              min="0"
              value={form.minStock || ''}
              onChange={(e) => updateField('minStock', parseInt(e.target.value) || 0)}
              className="input"
              placeholder="5"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {loading ? 'Guardando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
