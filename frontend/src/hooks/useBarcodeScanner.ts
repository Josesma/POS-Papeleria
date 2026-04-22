import { useEffect, useRef } from 'react';

/**
 * Custom hook to listen for hardware barcode scanner inputs (acting as a keyboard).
 * @param onScan Callback function triggered when a barcode is successfully read.
 */
export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (unless it's specifically marked for scanning)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // We only want to skip if it's NOT our barcode logic
        // But most scanners are fast enough that we can detect them by timing
      }

      const currentTime = Date.now();
      const diff = currentTime - lastKeyTimeRef.current;

      // Barcode scanners type very fast. If the delay between keys is < 30ms,
      // it's likely a scanner, not a human.
      if (diff > 50) {
        // Reset buffer if human types slowly
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 3) {
          onScan(bufferRef.current);
          e.preventDefault();
        }
        bufferRef.current = '';
      } else if (e.key.length === 1) { // Printable characters
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
}
