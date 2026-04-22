import { useHotkeys } from 'react-hotkeys-hook';
import { useCartStore } from '../store/cartStore';

interface ShortcutProps {
  onSearchFocus: () => void;
  onCheckout: () => void;
}

export const useKeyboardShortcuts = ({ onSearchFocus, onCheckout }: ShortcutProps) => {
  const { clearCart, itemCount } = useCartStore();

  // F2: Focus search
  useHotkeys('f2', (e) => {
    e.preventDefault();
    onSearchFocus();
  });

  // F5: Start checkout
  useHotkeys('f5', (e) => {
    e.preventDefault();
    if (itemCount > 0) {
      onCheckout();
    }
  });

  // F8: Clear cart
  useHotkeys('f8', (e) => {
    e.preventDefault();
    if (itemCount > 0) {
      if (confirm('¿Estás seguro de que deseas limpiar el carrito?')) {
        clearCart();
      }
    }
  });
};
