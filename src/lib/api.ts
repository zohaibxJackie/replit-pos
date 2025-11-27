const API_BASE_URL = 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const token = getAuthToken();
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request('/api/auth/login', { method: 'POST', body: credentials }),
    
    register: (data: { name: string; email: string; phone: string; businessName: string; password: string; role: string }) =>
      request('/api/auth/register', { method: 'POST', body: { 
        username: data.name, 
        email: data.email, 
        password: data.password, 
        role: data.role, 
        phone: data.phone, 
        businessName: data.businessName 
      } }),
    
    logout: () =>
      request('/api/auth/logout', { method: 'POST' }),
    
    refresh: () =>
      request('/api/auth/refresh', { method: 'POST' }),
    
    me: () =>
      request('/api/auth/me'),
  },

  users: {
    getAll: () =>
      request('/api/users'),
    
    getById: (id: string) =>
      request(`/api/users/${id}`),
    
    update: (id: string, data: Partial<{ name: string; email: string; phone: string; active: boolean }>) =>
      request(`/api/users/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/users/${id}`, { method: 'DELETE' }),
    
    addStaff: (data: { name: string; email: string; phone: string; password: string; role: string; shopId?: string }) =>
      request('/api/users/staff', { method: 'POST', body: data }),
  },

  roles: {
    getAll: () =>
      request('/api/roles'),
    
    assign: (userId: string, roleId: string) =>
      request('/api/roles/assign', { method: 'POST', body: { userId, roleId } }),
    
    remove: (userId: string, roleId: string) =>
      request('/api/roles/remove', { method: 'POST', body: { userId, roleId } }),
  },

  loginHistory: {
    getByUser: (userId: string) =>
      request(`/api/login-history/user/${userId}`),
    
    getAll: () =>
      request('/api/login-history'),
  },

  userDetails: {
    get: (userId: string) =>
      request(`/api/user-details/${userId}`),
    
    create: (userId: string, data: { address?: string; nationality?: string; passport?: string; moreInfo?: Record<string, unknown> }) =>
      request(`/api/user-details/${userId}`, { method: 'POST', body: data }),
    
    update: (userId: string, data: { address?: string; nationality?: string; passport?: string; moreInfo?: Record<string, unknown> }) =>
      request(`/api/user-details/${userId}`, { method: 'PUT', body: data }),
    
    delete: (userId: string) =>
      request(`/api/user-details/${userId}`, { method: 'DELETE' }),
  },

  shops: {
    getAll: () =>
      request('/api/shops'),
    
    getById: (id: string) =>
      request(`/api/shops/${id}`),
    
    create: (data: { name: string; phone?: string; whatsapp?: string; address?: string }) =>
      request('/api/shops', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; phone: string; whatsapp: string; address: string }>) =>
      request(`/api/shops/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/shops/${id}`, { method: 'DELETE' }),
    
    getStaff: (shopId: string) =>
      request(`/api/shops/${shopId}/staff`),
  },

  products: {
    getAll: (shopId?: string) =>
      request(shopId ? `/api/products?shopId=${shopId}` : '/api/products'),
    
    getById: (id: string) =>
      request(`/api/products/${id}`),
    
    create: (data: { shopId: string; name: string; barcode?: string; categoryId?: string; price: string; stock?: number; lowStockThreshold?: number }) =>
      request('/api/products', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; barcode: string; categoryId: string; price: string; stock: number; lowStockThreshold: number }>) =>
      request(`/api/products/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/products/${id}`, { method: 'DELETE' }),
    
    getLowStock: (shopId: string) =>
      request(`/api/products/low-stock?shopId=${shopId}`),
  },

  categories: {
    getAll: (shopId?: string) =>
      request(shopId ? `/api/categories?shopId=${shopId}` : '/api/categories'),
    
    getById: (id: string) =>
      request(`/api/categories/${id}`),
    
    create: (data: { shopId: string; name: string; type: string; parentId?: string; level?: number }) =>
      request('/api/categories', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; type: string; parentId: string; level: number }>) =>
      request(`/api/categories/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  customers: {
    getAll: (shopId?: string) =>
      request(shopId ? `/api/customers?shopId=${shopId}` : '/api/customers'),
    
    getById: (id: string) =>
      request(`/api/customers/${id}`),
    
    create: (data: { shopId: string; name: string; email?: string; phone?: string; address?: string }) =>
      request('/api/customers', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; email: string; phone: string; address: string }>) =>
      request(`/api/customers/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/customers/${id}`, { method: 'DELETE' }),
  },

  sales: {
    getAll: (shopId?: string) =>
      request(shopId ? `/api/sales?shopId=${shopId}` : '/api/sales'),
    
    getById: (id: string) =>
      request(`/api/sales/${id}`),
    
    create: (data: { 
      shopId: string; 
      salesPersonId: string; 
      customerId?: string; 
      paymentMethod?: string; 
      subtotal: string; 
      tax?: string; 
      discount?: string; 
      total: string;
      items: { productId: string; quantity: number; price: string; total: string }[]
    }) =>
      request('/api/sales', { method: 'POST', body: data }),
    
    getItems: (saleId: string) =>
      request(`/api/sales/${saleId}/items`),
  },

  notifications: {
    getAll: () =>
      request('/api/notifications'),
    
    markAsRead: (id: string) =>
      request(`/api/notifications/${id}/read`, { method: 'PUT' }),
  },

  activityLogs: {
    getAll: () =>
      request('/api/activity-logs'),
    
    getByUser: (userId: string) =>
      request(`/api/activity-logs/user/${userId}`),
  },

  pricingPlans: {
    getAll: () =>
      request('/api/pricing-plans'),
    
    getById: (id: string) =>
      request(`/api/pricing-plans/${id}`),
    
    create: (data: { name: string; price: string; maxStaff: number; maxProducts: number; features?: string[] }) =>
      request('/api/pricing-plans', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; price: string; maxStaff: number; maxProducts: number; features: string[]; isActive: boolean }>) =>
      request(`/api/pricing-plans/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/pricing-plans/${id}`, { method: 'DELETE' }),
  },

  featureFlags: {
    getAll: () =>
      request('/api/feature-flags'),
    
    getByName: (name: string) =>
      request(`/api/feature-flags/${name}`),
    
    update: (id: string, data: { isEnabled: boolean }) =>
      request(`/api/feature-flags/${id}`, { method: 'PUT', body: data }),
  },

  repairJobs: {
    getAll: (shopId?: string) =>
      request(shopId ? `/api/repair-jobs?shopId=${shopId}` : '/api/repair-jobs'),
    
    getById: (id: string) =>
      request(`/api/repair-jobs/${id}`),
    
    create: (data: {
      shopId: string;
      customerName: string;
      customerPhone: string;
      customerDni?: string;
      deviceBrand: string;
      deviceModel: string;
      imei?: string;
      defectSummary: string;
      problemDescription: string;
      priority?: 'normal' | 'urgent';
      estimatedCost?: string;
      advancePayment?: string;
    }) =>
      request('/api/repair-jobs', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{
      status: string;
      repairPersonId: string;
      repairPersonName: string;
      estimatedCost: string;
    }>) =>
      request(`/api/repair-jobs/${id}`, { method: 'PUT', body: data }),
  },

  repairPersons: {
    getAll: (shopId?: string) =>
      request(shopId ? `/api/repair-persons?shopId=${shopId}` : '/api/repair-persons'),
    
    create: (data: { shopId: string; name: string; phone?: string; email?: string }) =>
      request('/api/repair-persons', { method: 'POST', body: data }),
  },
};

export default api;
