import { useMutation } from '@tanstack/react-query';
import { useAuthStore, AuthResponse, User } from '@/store/authStore';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import api from '@/lib/api';

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
      const response = await api.auth.login(credentials) as AuthResponse;
      return response;
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
      const response = await api.auth.register(credentials) as AuthResponse;
      return response;
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
