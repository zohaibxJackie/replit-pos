import i18n from '@/config/i18n';

const API_BASE_URL = 'http://localhost:3001';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface CustomerType {
  id: string;
  shopId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  dob?: string | null;
  nationality?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  totalPurchases?: string;
  unpaidBalance?: string;
  lastPurchaseDate?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCreateType {
  name: string;
  email?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  dob?: string;
  nationality?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  status?: string;
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
      productCategory?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.shopId) searchParams.set('shopId', params.shopId);
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.productCategory) searchParams.set('productCategory', params.productCategory);
      const query = searchParams.toString();
      return request<{ 
        products: Array<{
          id: string;
          shopId: string;
          variantId: string;
          variantName: string;
          productName: string;
          brandName: string;
          categoryName: string;
          color?: string;
          storageSize?: string;
          barcode?: string;
          primaryImei?: string;
          secondaryImei?: string;
          serialNumber?: string;
          salePrice: string;
          purchasePrice?: string;
          stockStatus: string;
          isSold: boolean;
          condition: string;
          vendorId?: string;
          sku?: string;
          lowStockThreshold?: number;
          notes?: string;
          createdAt: string;
          updatedAt: string;
          customName?: string;
          imei1?: string;
          imei2?: string;
          stock?: number;
        }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(query ? `/api/products?${query}` : '/api/products');
    },
    
    getById: (id: string) =>
      request<{ product: {
        id: string;
        shopId: string;
        variantId: string;
        variantName: string;
        productName: string;
        brandName: string;
        categoryName: string;
        color?: string;
        storageSize?: string;
        barcode?: string;
        primaryImei?: string;
        secondaryImei?: string;
        serialNumber?: string;
        salePrice: string;
        purchasePrice?: string;
        stockStatus: string;
        isSold: boolean;
        condition: string;
        vendorId?: string;
        sku?: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
      }}>(`/api/products/${id}`),
    
    getByBarcode: (barcode: string) =>
      request<{ product: { id: string; variantName?: string; barcode: string; salePrice: string; stockStatus: string } }>(`/api/products/barcode/${barcode}`),
    
    getByImei: (imei: string) =>
      request<{ product: { id: string; variantName?: string; primaryImei?: string; secondaryImei?: string; salePrice: string; stockStatus: string } }>(`/api/products/imei/${imei}`),
    
    create: (data: { 
      shopId: string; 
      variantId?: string;
      barcode?: string; 
      salePrice: number;
      purchasePrice?: number;
      lowStockThreshold?: number;
      primaryImei?: string;
      secondaryImei?: string;
      serialNumber?: string;
      vendorId?: string;
      condition?: string;
      notes?: string;
      taxId?: string;
    }) =>{
      console.log(data)
      return request('/api/products', { method: 'POST', body: data })},
    
    update: (id: string, data: Partial<{ 
      variantId: string;
      barcode: string; 
      salePrice: number;
      purchasePrice: number;
      lowStockThreshold: number;
      primaryImei: string;
      secondaryImei: string;
      serialNumber: string;
      sku: string;
      vendorId: string;
      condition: string;
      stockStatus: string;
      notes: string;
    }>) =>
      request(`/api/products/${id}`, { method: 'PUT', body: data }),
    
    updateStock: (id: string, data: { type: 'add' | 'subtract' | 'set'; quantity: number }) =>
      request(`/api/products/${id}/stock`, { method: 'PATCH', body: data }),
    
    delete: (id: string) =>
      request(`/api/products/${id}`, { method: 'DELETE' }),
    
    getLowStock: (shopId?: string) =>
      request(shopId ? `/api/products/low-stock?shopId=${shopId}` : '/api/products/low-stock'),
    
    bulkCreate: (data: { 
      shopId: string;
      categoryId?: 'mobile' | 'accessories';
      variantId?: string;
      salePrice: number;
      purchasePrice?: number;
      lowStockThreshold?: number;
      vendorId?: string;
      condition?: string;
      quantity: number;
      imeis: Array<{ primaryImei: string; secondaryImei?: string | null }>;
    }) =>{
      console.log(data)
      return request<{ products: Array<{ id: string }>; count: number }>('/api/products/bulk', { method: 'POST', body: data })
    },
    
    getBrands: () =>
      request<{ brands: Array<{ id: string; name: string }> }>('/api/products/brands'),
    
    getCategories: () =>
      request<{ categories: Array<{ id: string; name: string }> }>('/api/products/categories'),
    
    getVariants: (params?: { brandId?: string; categoryId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.brandId) searchParams.set('brandId', params.brandId);
      if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
      const query = searchParams.toString();
      return request<{ variants: Array<{ id: string; name: string; brandId?: string; categoryId?: string }> }>(query ? `/api/products/variants?${query}` : '/api/products/variants');
    },
  },

  vendors: {
    getAll: (userId?: string) =>
      request<{ vendors: Array<{ id: string; name: string; phone?: string; email?: string; address?: string; createdAt: string }> }>(userId ? `/api/vendors?userId=${userId}` : '/api/vendors'),
    
    getById: (id: string) =>
      request<{ vendor: { id: string; shopId: string; name: string; phone?: string; email?: string; address?: string; createdAt: string } }>(`/api/vendors/${id}`),
    
    getProducts: (id: string) =>
      request<{ products: Array<{ id: string; variantName?: string; salePrice: string; stockStatus: string }> }>(`/api/vendors/${id}/products`),
    
    create: (data: { shopId: string; name: string; phone?: string; email?: string; address?: string }) =>
      request<{ vendor: { id: string; name: string; phone?: string; email?: string; address?: string } }>('/api/vendors', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; phone: string; email: string; address: string }>) =>
      request<{ vendor: { id: string; name: string; phone?: string; email?: string; address?: string } }>(`/api/vendors/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/vendors/${id}`, { method: 'DELETE' }),
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
    
    getColors: (selectedModel: object) => {
      const productId:string = selectedModel?.productId;
      const params = new URLSearchParams({ productId });
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
      return request<{ taxes: Array<{ id: string; shopId: string; name: string; type: 'flat'; value: string; isActive: boolean; createdAt: string; updatedAt: string }> }>(query ? `/api/taxes?${query}` : '/api/taxes');
    },
    
    getById: (id: string) =>
      request<{ tax: { id: string; shopId: string; name: string; type: 'flat'; value: string; isActive: boolean } }>(`/api/taxes/${id}`),
    
    create: (data: { name: string; value: number }) =>
      request<{ tax: { id: string; name: string; type: 'flat'; value: string; isActive: boolean } }>('/api/taxes', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<{ name: string; value: number; isActive: boolean }>) =>
      request<{ tax: { id: string; name: string; type: 'flat'; value: string; isActive: boolean } }>(`/api/taxes/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/taxes/${id}`, { method: 'DELETE' }),
  },

  stockTransfers: {
    getAll: () =>
      request<{ transfers: Array<{ id: string; stockId: string; fromShopId: string; toShopId: string; status: string; notes?: string; createdBy: string; createdAt: string }> }>('/api/stock-transfers'),
    
    create: (data: { stockId: string; fromShopId: string; toShopId: string; notes?: string }) =>
      request<{ transfer: { id: string; stockId: string; fromShopId: string; toShopId: string; status: string } }>('/api/stock-transfers', { method: 'POST', body: data }),
    
    getProductByImei: (imei: string) =>
      request<{ product: { 
        id: string; 
        shopId: string; 
        variantId: string;
        variantName?: string;
        productName?: string;
        brandName?: string;
        categoryName?: string;
        color?: string;
        storageSize?: string;
        salePrice: string;
        purchasePrice?: string;
        primaryImei?: string; 
        secondaryImei?: string; 
        barcode?: string;
        serialNumber?: string;
        stockStatus: string;
        isSold: boolean;
        condition: string;
        vendorId?: string;
        sku?: string;
        lowStockThreshold?: number;
        createdAt?: string;
        updatedAt?: string;
      } }>(`/api/stock-transfers/product/${imei}`),
  },

  categories: {
    getAll: () =>
      request<{ categories: Array<{ id: string; name: string }> }>('/api/categories'),
    
    getById: (id: string) =>
      request<{ category: { id: string; name: string }; productCount: number }>(`/api/categories/${id}`),
    
    create: (data: { name: string }) =>
      request<{ category: { id: string; name: string } }>('/api/categories', { method: 'POST', body: data }),
    
    update: (id: string, data: { name: string }) =>
      request<{ category: { id: string; name: string } }>(`/api/categories/${id}`, { method: 'PUT', body: data }),
    
    delete: (id: string) =>
      request(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  customers: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.search) searchParams.set('search', params.search);
      return request<{ 
        customers: Array<CustomerType>; 
        pagination: { page: number; limit: number; total: number; totalPages: number } 
      }>(`/api/customers?${searchParams.toString()}`);
    },
    
    search: (search: string, page: number = 1, limit: number = 10) =>
      request<{ customers: Array<CustomerType>; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/customers?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`),
    
    getById: (id: string) =>
      request<{ customer: CustomerType; recentSales: Array<any> }>(`/api/customers/${id}`),
    
    create: (data: CustomerCreateType) =>
      request<{ customer: CustomerType }>('/api/customers', { method: 'POST', body: data }),
    
    update: (id: string, data: Partial<CustomerCreateType>) =>
      request<{ customer: CustomerType }>(`/api/customers/${id}`, { method: 'PUT', body: data }),
    
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
      items: { stockId: string; price: string; total: string }[]
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
    getAll: (params?: { page?: number; limit?: number; entityType?: string; action?: string; userId?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.entityType) searchParams.set('entityType', params.entityType);
      if (params?.action) searchParams.set('action', params.action);
      if (params?.userId) searchParams.set('userId', params.userId);
      const query = searchParams.toString();
      return request<{
        activityLogs: Array<{
          id: string;
          userId: string;
          action: string;
          entityType: string;
          entityId?: string | null;
          details?: string | null;
          ipAddress?: string | null;
          userAgent?: string | null;
          createdAt: string;
        }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(query ? `/api/notifications/activity-logs?${query}` : '/api/notifications/activity-logs');
    },
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
