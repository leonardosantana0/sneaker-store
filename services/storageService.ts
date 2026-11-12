import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, UserProfile } from '../types';

const CART_KEY = '@sneakerstore:cart';
const PROFILE_KEY = '@sneakerstore:profile';

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const saveCart = async (items: CartItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[StorageService] saveCart error:', error);
  }
};

export const loadCart = async (): Promise<CartItem[]> => {
  try {
    const data = await AsyncStorage.getItem(CART_KEY);
    return data ? (JSON.parse(data) as CartItem[]) : [];
  } catch (error) {
    console.error('[StorageService] loadCart error:', error);
    return [];
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('[StorageService] clearCart error:', error);
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────

export const saveProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('[StorageService] saveProfile error:', error);
  }
};

export const loadProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    return data ? (JSON.parse(data) as UserProfile) : null;
  } catch (error) {
    console.error('[StorageService] loadProfile error:', error);
    return null;
  }
};
