import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../services/api';
import { Product } from '../types';
import { useDebounce } from './useDebounce';

export function useProducts(initialSearch = '', initialCategory = '') {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await productApi.getAll({
        search: debouncedSearch || undefined,
        category: category || undefined,
      });
      setProducts(result.products);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await productApi.getCategories();
      setCategories(cats);
    } catch {
      // Silently fail for categories
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refetch = useCallback(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return {
    products,
    categories,
    search,
    setSearch,
    category,
    setCategory,
    loading,
    error,
    refetch,
  };
}
