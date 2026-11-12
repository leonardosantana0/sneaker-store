import { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../utils/mockData';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para carregar a listagem de produtos.
 * Simula um carregamento assíncrono (useEffect + useState).
 */
export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = () => {
    try {
      setProducts(PRODUCTS);
      setError(null);
    } catch (e) {
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};
