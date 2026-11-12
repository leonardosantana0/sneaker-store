import React, {
  createContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { CartItem, CartState, CartAction, Product } from '../types';
import { saveCart, loadCart } from '../services/storageService';

// ─── Reducer ──────────────────────────────────────────────────────────────────

const computeTotals = (items: CartItem[]) => ({
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOAD_CART': {
      const items = action.payload;
      return { items, ...computeTotals(items) };
    }

    case 'ADD_ITEM': {
      const { product, size, color } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size,
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        newItems = [
          ...state.items,
          { product, quantity: 1, selectedSize: size, selectedColor: color },
        ];
      }

      saveCart(newItems);
      return { items: newItems, ...computeTotals(newItems) };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (item) =>
          !(item.product.id === action.payload.productId && item.selectedSize === action.payload.size),
      );
      saveCart(newItems);
      return { items: newItems, ...computeTotals(newItems) };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, size, quantity } = action.payload;
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = state.items.filter(
          (item) => !(item.product.id === productId && item.selectedSize === size),
        );
      } else {
        newItems = state.items.map((item) =>
          item.product.id === productId && item.selectedSize === size
            ? { ...item, quantity }
            : item,
        );
      }
      saveCart(newItems);
      return { items: newItems, ...computeTotals(newItems) };
    }

    case 'CLEAR_CART': {
      saveCart([]);
      return { items: [], itemCount: 0, total: 0 };
    }

    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (product: Product, size: number, color: string) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
}

const initialState: CartState = { items: [], total: 0, itemCount: 0 };

export const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from AsyncStorage on mount (useEffect)
  useEffect(() => {
    const initCart = async () => {
      const savedItems = await loadCart();
      if (savedItems.length > 0) {
        dispatch({ type: 'LOAD_CART', payload: savedItems });
      }
    };
    initCart();
  }, []);

  const addToCart = useCallback((product: Product, size: number, color: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, size, color } });
  }, []);

  const removeFromCart = useCallback((productId: string, size: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } });
  }, []);

  const updateQuantity = useCallback((productId: string, size: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  return (
    <CartContext.Provider
      value={{ state, dispatch, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
