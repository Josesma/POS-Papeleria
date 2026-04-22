import { create } from 'zustand';
import { shiftApi } from '../services/api';
import toast from 'react-hot-toast';

interface ShiftUser {
  id: number;
  name: string;
}

interface Shift {
  id: number;
  status: 'OPEN' | 'CLOSED';
  initialBalance: number;
  expectedBalance: number;
  startTime: string;
  user?: ShiftUser;
}

interface ShiftState {
  activeShift: Shift | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  fetchActiveShift: () => Promise<void>;
  openShift: (initialBalance: number) => Promise<void>;
  closeShift: (actualBalance: number) => Promise<void>;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  activeShift: null,
  loading: false,
  initialized: false,

  fetchActiveShift: async () => {
    try {
      set({ loading: true });
      const shift = await shiftApi.getActive();
      // shift will be null if no active shift exists, or the shift object
      set({ activeShift: shift || null, initialized: true });
    } catch (error) {
      console.error('Error fetching shift:', error);
      // Even on error, mark as initialized so the UI doesn't hang
      set({ activeShift: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  openShift: async (initialBalance: number) => {
    try {
      set({ loading: true });
      const shift = await shiftApi.open(initialBalance);
      set({ activeShift: shift });
      toast.success('Punto de venta abierto correctamente');
    } catch (error: any) {
      // If the error is "already have an open shift", auto-sync by fetching active
      if (error.message?.includes('turno abierto') || error.status === 400) {
        toast.error('Ya tienes un turno abierto. Sincronizando...');
        // Re-fetch to sync state
        await get().fetchActiveShift();
      } else {
        toast.error(error.message || 'Error al abrir caja');
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  closeShift: async (actualBalance: number) => {
    const { activeShift } = get();
    if (!activeShift) return;

    try {
      set({ loading: true });
      await shiftApi.close(activeShift.id, actualBalance);
      set({ activeShift: null });
      toast.success('Corte de caja realizado correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al realizar el corte de caja');
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
