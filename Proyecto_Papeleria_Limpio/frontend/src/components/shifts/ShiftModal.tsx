import { useState } from 'react';
import { 
  X, Landmark, Loader2, ArrowRightCircle, 
  FileText, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useShiftStore } from '../../store/shiftStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'OPEN' | 'CLOSE';
}

export default function ShiftModal({ isOpen, onClose, mode }: ShiftModalProps) {
  const { openShift, closeShift, activeShift, loading } = useShiftStore();
  const [balance, setBalance] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      return toast.error('Ingresa un saldo inicial válido');
    }
    
    try {
      await openShift(amount);
      setBalance('');
      onClose();
    } catch (err) {
      // The store already handles 400 errors and auto-syncs
      // If it synced successfully, close this modal
      const shift = useShiftStore.getState().activeShift;
      if (shift) {
        onClose();
      }
    }
  };

  const handleCloseShift = async () => {
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      return toast.error('Ingresa el saldo final contado en caja');
    }

    try {
      setIsClosing(true);
      
      // Generate PDF BEFORE closing (while we still have the shift data)
      try {
        generatePDFReport(amount);
      } catch (pdfErr) {
        console.error('PDF generation error:', pdfErr);
        // Don't block the close if PDF fails
        toast.error('No se pudo generar el PDF, pero se cerrará la caja');
      }
      
      // Close in DB
      await closeShift(amount);
      
      setBalance('');
      onClose();
    } catch (err) {
      console.error('Close shift error:', err);
    } finally {
      setIsClosing(false);
    }
  };

  const generatePDFReport = (actualBalance: number) => {
    if (!activeShift) return;
    
    const doc = new jsPDF() as any;
    const date = new Date().toLocaleString('es-MX');
    const discrepancy = actualBalance - activeShift.expectedBalance;
    const userName = activeShift.user?.name || 'Usuario';

    // Header
    doc.setFontSize(22);
    doc.text('REPORTE DE CORTE DE CAJA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Fecha/Hora: ${date}`, 105, 30, { align: 'center' });
    doc.line(20, 35, 190, 35);

    // Summary Table
    const data = [
      ['Cajero', userName],
      ['Apertura', new Date(activeShift.startTime).toLocaleString('es-MX')],
      ['Cierre', date],
      ['', ''],
      ['Saldo Inicial', `$${activeShift.initialBalance.toFixed(2)}`],
      ['Ventas del Turno', `$${(activeShift.expectedBalance - activeShift.initialBalance).toFixed(2)}`],
      ['Saldo Esperado', `$${activeShift.expectedBalance.toFixed(2)}`],
      ['Saldo Real Contado', `$${actualBalance.toFixed(2)}`],
      ['Diferencia', `$${discrepancy.toFixed(2)}`],
    ];

    doc.autoTable({
      startY: 45,
      head: [['Concepto', 'Valor']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    // Signature line
    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.line(70, finalY, 140, finalY);
    doc.text('Firma del Cajero', 105, finalY + 5, { align: 'center' });

    const safeName = date.replace(/[/:\s,]/g, '_');
    doc.save(`Corte_Caja_${safeName}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header decoration */}
        <div className={`h-2 ${mode === 'OPEN' ? 'bg-primary-500' : 'bg-rose-500'}`} />
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              mode === 'OPEN' ? 'bg-primary-50 text-primary-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {mode === 'OPEN' ? <Landmark className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {mode === 'OPEN' ? 'Apertura de Caja' : 'Corte de Caja'}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {mode === 'OPEN' 
              ? 'Ingresa el monto con el que inicias el turno para control de efectivo.' 
              : 'Verifica las ventas y registra el monto final contado en caja.'}
          </p>

          {mode === 'CLOSE' && activeShift && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2 border border-slate-100">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>Saldo Esperado</span>
                <span className="text-primary-600">${activeShift.expectedBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Saldo Inicial</span>
                <span>${activeShift.initialBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ventas del Turno</span>
                <span>${(activeShift.expectedBalance - activeShift.initialBalance).toFixed(2)}</span>
              </div>
            </div>
          )}

          <form onSubmit={mode === 'OPEN' ? handleOpenShift : (e) => e.preventDefault()} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                {mode === 'OPEN' ? 'Saldo Inicial' : 'Saldo Final Contado'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  required
                  autoFocus
                  type="number"
                  step="0.01"
                  className="input-field pl-9 h-14 text-lg"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>

            {mode === 'OPEN' ? (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-14 text-lg font-bold gap-2 shadow-lg shadow-primary-200"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightCircle className="w-5 h-5" />}
                Abrir Punto de Venta
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCloseShift}
                disabled={isClosing}
                className="btn-primary w-full h-14 bg-rose-600 hover:bg-rose-700 text-lg font-bold gap-2 shadow-lg shadow-rose-200"
              >
                {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Realizar Corte y Descargar PDF
              </button>
            )}
            
            {mode === 'CLOSE' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Al confirmar, el turno se cerrará y se descargará el reporte en PDF. Asegúrate de contar bien el efectivo.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
