import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuthStore, AuthResponse, User } from '@/store/authStore';

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
    onError: () => {
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
    onError: () => {
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
