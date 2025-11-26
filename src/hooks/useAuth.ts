import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuthStore, AuthResponse, User } from '@/store/authStore';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  businessName?: string;
}

export function useAuth(requiredRoles?: string | string[]) {
  const { isAuthenticated, user } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (requiredRoles) {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const userRole = user?.role ?? '';

      if (!rolesArray.includes(userRole)) {
        if (user?.role === 'super_admin') {
          setLocation('/super-admin/dashboard');
        } else if (user?.role === 'admin') {
          setLocation('/admin/dashboard');
        } else if (user?.role === 'sales_person') {
          setLocation('/pos');
        } else if (user?.role === 'repair_man') {
          setLocation('/repair-man/dashboard');
        } else if (user?.role === 'wholesaler') {
          setLocation('/wholesaler/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, requiredRoles, setLocation]);

  return { isAuthenticated, user };
}

export function useLogin() {
  const { loginSuccess, setIsLoading } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setIsLoading(true);
      return apiRequest<AuthResponse>('POST', '/api/auth/login', credentials);
    },
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        loginSuccess(data.user, data.token);
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
      return apiRequest<AuthResponse>('POST', '/api/auth/signup', credentials);
    },
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        loginSuccess(data.user, data.token);
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
      return apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      logout();
    },
    onError: () => {
      logout();
    },
  });
}
