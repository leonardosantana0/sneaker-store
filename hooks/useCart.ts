import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Hook de acesso ao carrinho de compras.
 * Deve ser usado dentro de um <CartProvider>.
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
