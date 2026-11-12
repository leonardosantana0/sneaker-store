export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  sizes: number[];
  colors: string[];
  rating: number;
  reviewCount: number;
  category: 'running' | 'casual' | 'basketball' | 'training';
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

export type CartAction =
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: { product: Product; size: number; color: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: number; quantity: number } }
  | { type: 'CLEAR_CART' };

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Address {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photoUri: string | null;
}
