import { useState, useEffect, useCallback } from 'react';
import { saleApi } from '../services/api';
import { Sale } from '../types';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await saleApi.getAll({ page, limit: 20 });
      setSales(result.sales);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar ventas';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const refetch = useCallback(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    page,
    setPage,
    totalPages,
    refetch,
  };
}
