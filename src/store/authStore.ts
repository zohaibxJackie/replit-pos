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
  token?: string;
  shop?: Shop;
  shops?: Shop[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  shops: Shop[];
  currentShop: Shop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setShops: (shops: Shop[]) => void;
  setCurrentShop: (shop: Shop | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  loginSuccess: (user: User, token: string, shops?: Shop[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      shops: [],
      currentShop: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setShops: (shops) => set({ shops, currentShop: shops.length > 0 ? shops[0] : null }),
      setCurrentShop: (currentShop) => set({ currentShop }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      loginSuccess: (user, token, shops = []) => set({ 
        user, 
        token, 
        shops,
        currentShop: shops.length > 0 ? shops[0] : null,
        isAuthenticated: true,
        isLoading: false 
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
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
