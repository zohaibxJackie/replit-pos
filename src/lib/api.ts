import i18n from '@/config/i18n';

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

function getCurrentLanguage(): string {
  return i18n.language || 'en';
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const token = getAuthToken();
  const currentLang = getCurrentLanguage();
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': currentLang,
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
    
    getMyShops: () =>
      request<{ shops: Array<{ id: string; name: string; phone?: string; whatsapp?: string; address?: string; subscriptionTier: string; subscriptionStatus: string; createdAt: string }>; maxShops: number; canAddMore: boolean }>('/api/shops/my-shops'),
    
    createAdminShop: (data: { name: string; phone?: string; whatsapp?: string; address?: string }) =>
      request('/api/shops/admin', { method: 'POST', body: data }),
    
    updateAdminShop: (id: string, data: Partial<{ name: string; phone: string; whatsapp: string; address: string }>) =>
      request(`/api/shops/admin/${id}`, { method: 'PUT', body: data }),
  },

  products: {
    getAll: (params?: { 
      shopId?: string; 
      page?: number; 
      limit?: number; 
      search?: string; 
      status?: string;
      categoryId?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.shopId) searchParams.set('shopId', params.shopId);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
      const query = searchParams.toString();
      return request<{ 
        products: Array<{
          id: string;
          shopId: string;
          categoryId: string;
          customName?: string;
          barcode?: string;
          salePrice: string;
          purchasePrice?: string;
          stock: number;
          imei1?: string;
          imei2?: string;
          sku?: string;
          mobileCatalogId?: string;
          accessoryCatalogId?: string;
          vendorId?: string;
          lowStockThreshold?: number;
          createdAt: string;
          updatedAt: string;
        }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(query ? `/api/products?${query}` : '/api/products');
    },
    
    getById: (id: string) =>
      request<{ product: {
        id: string;
        shopId: string;
        categoryId: string;
        customName?: string;
        barcode?: string;
        salePrice: string;
        purchasePrice?: string;
        stock: number;
        imei1?: string;
        imei2?: string;
        sku?: string;
        mobileCatalogId?: string;
        accessoryCatalogId?: string;
        vendorId?: string;
        lowStockThreshold?: number;
        createdAt: string;
        updatedAt: string;
      }}>(`/api/products/${id}`),
    
    getByBarcode: (barcode: string) =>
      request<{ product: { id: string; customName?: string; barcode: string; salePrice: string; stock: number } }>(`/api/products/barcode/${barcode}`),
    
    getByImei: (imei: string) =>
      request<{ product: { id: string; customName?: string; imei1?: string; imei2?: string; salePrice: string; stock: number } }>(`/api/products/imei/${imei}`),
    
    create: (data: { 
      shopId: string; 
      categoryId: 'mobile' | 'accessories';
      customName?: string;
      barcode?: string; 
      salePrice: number;
      purchasePrice?: number;
      stock?: number; 
      lowStockThreshold?: number;
      imei1?: string;
      imei2?: string;
      sku?: string;
      mobileCatalogId?: string;
      accessoryCatalogId?: string;
      vendorId?: string;
    }) =>
      request('/api/products', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ 
      customName: string;
      barcode: string; 
      salePrice: number;
      purchasePrice: number;
      stock: number; 
      lowStockThreshold: number;
      imei1: string;
      imei2: string;
      sku: string;
      mobileCatalogId: string;
      accessoryCatalogId: string;
      vendorId: string;
    }>) =>
      request(`/api/products/${id}`, { method: 'PUT', body: data }),
    
    updateStock: (id: string, data: { type: 'add' | 'subtract' | 'set'; quantity: number }) =>
      request(`/api/products/${id}/stock`, { method: 'PATCH', body: data }),
    
    delete: (id: string) =>
      request(`/api/products/${id}`, { method: 'DELETE' }),
    
    getLowStock: (shopId?: string) =>
      request(shopId ? `/api/products/low-stock?shopId=${shopId}` : '/api/products/low-stock'),
  },

  mobileCatalog: {
    getAll: (params?: { page?: number; limit?: number; search?: string; brand?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.brand) searchParams.set('brand', params.brand);
      const query = searchParams.toString();
      return request<{ 
        mobiles: Array<{ id: string; brand: string; name: string; memory?: string; color?: string; gsmUrl?: string }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(query ? `/api/products/catalog/mobiles?${query}` : '/api/products/catalog/mobiles');
    },
    
    getBrands: () =>
      request<{ brands: string[] }>('/api/products/catalog/mobiles/brands'),
    
    getModels: (brand: string) =>
      request<{ models: Array<{ id: string; name: string; memory?: string; displayName: string }> }>(`/api/products/catalog/mobiles/models?brand=${encodeURIComponent(brand)}`),
    
    getColors: (brand: string, model: string, memory?: string) => {
      const params = new URLSearchParams({ brand, model });
      if (memory) params.set('memory', memory);
      return request<{ colors: Array<{ id: string; color: string }> }>(`/api/products/catalog/mobiles/colors?${params.toString()}`);
    },
    
    getItem: (brand: string, model: string, memory?: string, color?: string) => {
      const params = new URLSearchParams({ brand, model });
      if (memory) params.set('memory', memory);
      if (color) params.set('color', color);
      return request<{ catalogItem: { id: string; brand: string; name: string; memory?: string; color?: string; gsmUrl?: string } }>(`/api/products/catalog/mobiles/item?${params.toString()}`);
    },
  },

  accessoryCatalog: {
    getAll: (params?: { page?: number; limit?: number; search?: string; brand?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.brand) searchParams.set('brand', params.brand);
      const query = searchParams.toString();
      return request<{ 
        accessories: Array<{ id: string; brand: string; name: string; category?: string }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(query ? `/api/products/catalog/accessories?${query}` : '/api/products/catalog/accessories');
    },
    
    getBrands: () =>
      request<{ brands: string[] }>('/api/products/catalog/accessories/brands'),
  },

  taxes: {
    getAll: (params?: { search?: string; isActive?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set('search', params.search);
      if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
      const query = searchParams.toString();
      return request<{ taxes: Array<{ id: string; shopId: string; name: string; type: 'percent' | 'flat'; value: string; isActive: boolean; createdAt: string; updatedAt: string }> }>(query ? `/api/taxes?${query}` : '/api/taxes');
    },
    
    getById: (id: string) =>
      request<{ tax: { id: string; shopId: string; name: string; type: 'percent' | 'flat'; value: string; isActive: boolean } }>(`/api/taxes/${id}`),
    
    create: (data: { name: string; type: 'percent' | 'flat'; value: number }) =>
      request<{ tax: { id: string; name: string; type: 'percent' | 'flat'; value: string; isActive: boolean } }>('/api/taxes', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; type: 'percent' | 'flat'; value: number; isActive: boolean }>) =>
      request<{ tax: { id: string; name: string; type: 'percent' | 'flat'; value: string; isActive: boolean } }>(`/api/taxes/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/taxes/${id}`, { method: 'DELETE' }),
  },

  stockTransfers: {
    getAll: () =>
      request<{ transfers: Array<{ id: string; productId: string; fromShopId: string; toShopId: string; quantity: number; status: string; notes?: string; createdBy: string; createdAt: string }> }>('/api/stock-transfers'),
    
    create: (data: { productId: string; fromShopId: string; toShopId: string; quantity?: number; notes?: string }) =>
      request<{ transfer: { id: string; productId: string; fromShopId: string; toShopId: string; quantity: number; status: string } }>('/api/stock-transfers', { method: 'POST', body: data }),
    
    getProductByImei: (imei: string) =>
      request<{ product: { 
        id: string; 
        shopId: string; 
        categoryId: string;
        customName?: string;
        stock: number; 
        salePrice: string;
        purchasePrice?: string;
        imei1?: string; 
        imei2?: string; 
        barcode?: string;
        mobileCatalogId?: string;
        accessoryCatalogId?: string;
        vendorId?: string;
        sku?: string;
        lowStockThreshold?: number;
        createdAt?: string;
        updatedAt?: string;
      } }>(`/api/stock-transfers/product/${imei}`),
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
    
    search: (search: string, page: number = 1, limit: number = 10) =>
      request<{ customers: Array<{ id: string; name: string; email?: string; phone?: string; address?: string; totalPurchases?: string }>; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/customers?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`),
    
    getById: (id: string) =>
      request(`/api/customers/${id}`),
    
    create: (data: { name: string; email?: string; phone?: string; address?: string }) =>
      request<{ customer: { id: string; name: string; email?: string; phone?: string; address?: string } }>('/api/customers', { method: 'POST', body: data }),
    
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
