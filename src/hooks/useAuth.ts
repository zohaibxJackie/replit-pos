import { useMutation } from '@tanstack/react-query';
import { useAuthStore, AuthResponse, User } from '@/store/authStore';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import api from '@/lib/api';
import { 
  canAccessPage, 
  canAccessComponent,
  canAccess,
  getDefaultRedirectForRole,
  PageKey, 
  ComponentKey 
} from '@/config/accessControl';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  businessName: string;
}

export function useAuth(pageKey?: PageKey) {
  const { isAuthenticated, user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (pageKey) {
      const userRole = user?.role ?? '';
      
      if (!canAccessPage(userRole, pageKey)) {
        setLocation(getDefaultRedirectForRole(userRole));
      }
    }
  }, [isAuthenticated, user, pageKey, setLocation]);

  return { isAuthenticated, user };
}

export function useCanAccess() {
  const { user } = useAuthStore();
  
  return {
    canAccessPage: (pageKey: PageKey) => canAccessPage(user?.role, pageKey),
    canAccessComponent: (componentKey: ComponentKey) => canAccessComponent(user?.role, componentKey),
    canAccess: (key: PageKey | ComponentKey) => canAccess(user?.role, key),
  };
}

export function useLogin() {
  const { loginSuccess, setIsLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setIsLoading(true);
      const response = await api.auth.login(credentials) as AuthResponse;
      return response;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        loginSuccess(data.user, data.shops || []);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}

export function useSignup() {
  const { loginSuccess, setIsLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials): Promise<AuthResponse> => {
      setIsLoading(true);
      const response = await api.auth.register(credentials) as AuthResponse;
      return response;
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        loginSuccess(data.user, data.shops || []);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; message: string }> => {
      const response = await api.auth.logout() as { success: boolean; message: string };
      return response;
    },
    onSuccess: () => {
      logout();
    },
    onError: () => {
      logout();
    },
  });
}

export function useAddStaff() {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string; password: string; role: string; shopId?: string }) => {
      return api.users.addStaff(data);
    },
  });
}
