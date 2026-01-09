import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  currencyCode?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales_person' | 'repair_man' | 'wholesaler';
  businessName?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  currencyCode?: string;
  active?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  shop?: Shop;
  shops?: Shop[];
}

interface AuthState {
  user: User | null;
  shops: Shop[];
  currentShop: Shop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setShops: (shops: Shop[]) => void;
  setCurrentShop: (shop: Shop | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  loginSuccess: (user: User, shops?: Shop[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      shops: [],
      currentShop: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setShops: (shops) => set({ shops, currentShop: shops.length > 0 ? shops[0] : null }),
      setCurrentShop: (currentShop) => set({ currentShop }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      loginSuccess: (user, shops = []) => set({ 
        user, 
        shops,
        currentShop: shops.length > 0 ? shops[0] : null,
        isAuthenticated: true,
        isLoading: false 
      }),
      logout: () => set({ 
        user: null, 
        shops: [],
        currentShop: null,
        isAuthenticated: false,
        isLoading: false 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
