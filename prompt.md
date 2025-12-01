# Frontend API Integration Plan
## POS System - Phased Implementation

This document contains prompts to give to the AI agent in iterations. Each phase is self-contained and builds upon the previous one.

---

## PHASE 1: Authentication System
**Priority: Critical - Must complete first**

### Prompt for AI Agent:
```
Connect the authentication system to the backend API. The backend has these endpoints:
- POST /api/auth/login - Login with email/password
- POST /api/auth/register - Register new user
- POST /api/auth/logout - Logout user
- POST /api/auth/refresh-token - Refresh JWT token
- GET /api/auth/me - Get current user info
- PUT /api/auth/password - Update password

Files to update:
- src/pages/auth/Login.tsx
- src/pages/auth/Signup.tsx
- src/hooks/useAuth.ts (or create auth store)

Requirements:
1. Replace any mock authentication with real API calls
2. Store JWT token in localStorage via Zustand store
3. Handle token refresh automatically
4. Redirect to login on 401 errors
5. The API base URL is http://localhost:3001 (already configured in src/lib/queryClient.ts)

Use the existing apiRequest function from src/lib/queryClient.ts for mutations.
```

---

## PHASE 2: Admin Dashboard - Real Data
**Priority: High**

### Prompt for AI Agent:
```
Connect the Admin Dashboard to real backend data. Currently it uses mockPerShopStats.

Backend endpoints available:
- GET /api/sales/today - Get today's sales
- GET /api/sales/analytics - Get sales analytics
- GET /api/products/low-stock - Get low stock products
- GET /api/repairs/jobs - Get repair jobs (for devices in repair)
- GET /api/shops - Get shops list (super_admin only)

Files to update:
- src/pages/admin/Dashboard.tsx
- src/components/StatCard.tsx (if needed)
- src/components/SalesAnalyticsChart.tsx
- src/components/DevicesInRepair.tsx
- src/components/LastSales.tsx
- src/components/LowStockAlert.tsx

Requirements:
1. Replace mockPerShopStats with useQuery calls to real APIs
2. Add loading states while data is fetching
3. Add error handling for failed API calls
4. The shop selector should filter data by shopId when available
5. Use existing queryClient from src/lib/queryClient.ts
```

---

## PHASE 3: Products Management
**Priority: High**

### Prompt for AI Agent:
```
Connect Products pages to the backend API. Currently using mock data.

Backend endpoints:
- GET /api/products - List all products (with optional shopId filter)
- GET /api/products/:id - Get product by ID
- GET /api/products/barcode/:barcode - Get product by barcode
- POST /api/products - Create product (admin only)
- PUT /api/products/:id - Update product (admin only)
- PATCH /api/products/:id/stock - Update stock
- DELETE /api/products/:id - Delete product (admin only)

Files to update:
- src/pages/admin/sub pages/Products.tsx
- src/pages/admin/sub pages/AddProduct.tsx
- src/pages/admin/sub pages/ManageStock.tsx
- src/pages/pos/Products.tsx
- src/utils/mockData.ts (remove mockProducts usage)

Requirements:
1. Replace mockProducts with useQuery to /api/products
2. Implement create/update/delete with useMutation
3. Add search and filter functionality
4. Add barcode scanner integration with /api/products/barcode/:barcode
5. Show loading skeletons while fetching
6. Invalidate queries after mutations
```

---

## PHASE 4: Categories Management
**Priority: Medium**

### Prompt for AI Agent:
```
Connect Categories page to the backend API.

Backend endpoints:
- GET /api/categories - List all categories
- GET /api/categories/:id - Get category by ID
- POST /api/categories - Create category (admin only)
- PUT /api/categories/:id - Update category (admin only)
- DELETE /api/categories/:id - Delete category (admin only)

Files to update:
- src/pages/admin/sub pages/Category.tsx

Requirements:
1. Fetch categories using useQuery
2. Implement CRUD operations with useMutation
3. Support nested categories (parentId, level)
4. Add loading and error states
5. Invalidate cache after mutations
```

---

## PHASE 5: Customer Management
**Priority: High**

### Prompt for AI Agent:
```
Connect Customer pages to the backend API.

Backend endpoints:
- GET /api/customers - List customers (with search, pagination)
- GET /api/customers/:id - Get customer by ID
- POST /api/customers - Create customer
- PUT /api/customers/:id - Update customer
- DELETE /api/customers/:id - Delete customer

Files to update:
- src/pages/admin/Customer.tsx
- src/components/CustomerSearchSelect.tsx
- src/components/CustomerFormDialog.tsx

Requirements:
1. Replace any mock customer data with API calls
2. Implement customer search with debounce
3. Customer creation should work from POS and admin pages
4. Add pagination support
5. Show customer purchase history if available
```

---

## PHASE 6: POS System - Core Sales
**Priority: Critical**

### Prompt for AI Agent:
```
Connect the POS system to real backend for creating sales.

Backend endpoints:
- GET /api/products - Get products for cart
- GET /api/products/barcode/:barcode - Barcode lookup
- POST /api/sales - Create a sale
- GET /api/customers - Search customers

Files to update:
- src/pages/pos/POS.tsx
- src/components/ProductSearch.tsx
- src/components/CartItem.tsx

Requirements:
1. Replace mockProducts with real product API
2. Barcode scanner should call /api/products/barcode/:barcode
3. Sale submission should POST to /api/sales with format:
   {
     customerId?: string,
     paymentMethod: string,
     subtotal: string,
     tax?: string,
     discount?: string,
     total: string,
     items: [{ productId, quantity, price, total }]
   }
4. Update stock after successful sale
5. Clear cart after successful sale
6. Handle offline mode gracefully (show error if no connection)
```

---

## PHASE 7: Sales History & Reports
**Priority: Medium**

### Prompt for AI Agent:
```
Connect Sales pages to view sales history and reports.

Backend endpoints:
- GET /api/sales - List all sales
- GET /api/sales/:id - Get sale details
- GET /api/sales/today - Today's sales
- GET /api/sales/analytics - Sales analytics

Files to update:
- src/pages/admin/Sales.tsx
- src/pages/admin/SalesDetailPage.tsx
- src/pages/pos/Sales.tsx
- src/pages/admin/reports/*.tsx (various report pages)

Requirements:
1. List sales with pagination and filters
2. Click on sale to view details
3. Sales analytics for charts and graphs
4. Date range filtering
5. Export functionality if needed
```

---

## PHASE 8: Repair Jobs System
**Priority: Medium**

### Prompt for AI Agent:
```
Connect Repair system to backend API.

Backend endpoints:
- GET /api/repairs/jobs - List repair jobs
- GET /api/repairs/jobs/:id - Get job details
- POST /api/repairs/jobs - Create repair job
- PUT /api/repairs/jobs/:id - Update repair job
- POST /api/repairs/jobs/:id/payments - Add payment

- GET /api/repairs/persons - List repair persons
- POST /api/repairs/persons - Create repair person
- PUT /api/repairs/persons/:id - Update repair person
- DELETE /api/repairs/persons/:id - Delete repair person

Files to update:
- src/pages/admin/RepairBook.tsx
- src/pages/admin/RepairMen.tsx
- src/pages/repairman/*.tsx (all repairman pages)

Requirements:
1. CRUD for repair jobs
2. Status tracking (pending, in-progress, completed, delivered)
3. Payment tracking with multiple payments per job
4. Assign repair person to job
5. Print repair ticket functionality
```

---

## PHASE 9: User & Staff Management
**Priority: Medium**

### Prompt for AI Agent:
```
Connect User management to backend (already partially done in SaleManagers.tsx).

Backend endpoints:
- GET /api/users - List users
- GET /api/users/:id - Get user by ID
- POST /api/users - Create user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Soft delete user
- POST /api/users/:id/restore - Restore user
- GET /api/users/staff-limits - Get staff limits for plan
- POST /api/users/sales-person - Create sales person
- Password reset endpoints...

Files to update:
- src/pages/admin/SaleManagers.tsx (verify working)
- src/pages/superadmin/Users.tsx
- src/pages/superadmin/Admins.tsx
- src/pages/Profile.tsx

Requirements:
1. Verify SaleManagers.tsx is working correctly
2. Connect superadmin user management
3. Profile page should update via PUT /api/users/profile
4. Password change via PUT /api/auth/password
```

---

## PHASE 10: Wholesaler System
**Priority: Low**

### Prompt for AI Agent:
```
Connect Wholesaler system to backend.

Backend endpoints:
- GET /api/wholesaler/list - List wholesalers
- GET /api/wholesaler/products - List wholesaler products
- POST /api/wholesaler/products - Create product (wholesaler role)
- GET /api/wholesaler/orders - List purchase orders
- POST /api/wholesaler/orders - Create purchase order
- PATCH /api/wholesaler/orders/:id/status - Update order status
- GET /api/wholesaler/deals - List deal requests
- POST /api/wholesaler/deals - Create deal request

Files to update:
- src/pages/wholesaler/*.tsx (all wholesaler pages)
- src/pages/admin/Wholesalers.tsx
- src/pages/admin/WholesalersMarketplace.tsx
- src/pages/admin/PurchaseOrders.tsx

Requirements:
1. Wholesaler can list their products
2. Admin can browse wholesaler marketplace
3. Admin can create purchase orders
4. Wholesaler can accept/reject orders
5. Deal request system for negotiations
```

---

## PHASE 11: Notifications & Activity Logs
**Priority: Low**

### Prompt for AI Agent:
```
Connect Notifications system to backend.

Backend endpoints:
- GET /api/notifications - Get user notifications
- PATCH /api/notifications/:id/read - Mark as read
- PATCH /api/notifications/read-all - Mark all as read
- DELETE /api/notifications/:id - Delete notification
- GET /api/notifications/activity-logs - Get activity logs (admin)

Files to update:
- Create or update notification component in header/sidebar
- src/pages/admin/ActivityLogs.tsx
- src/pages/superadmin/ActivityLogs.tsx

Requirements:
1. Show notification bell with unread count
2. Dropdown to view recent notifications
3. Mark as read functionality
4. Activity logs page with filters
5. Real-time updates if possible (polling every 30s)
```

---

## PHASE 12: Shops Management (Super Admin)
**Priority: Low**

### Prompt for AI Agent:
```
Connect Shops management for super admin.

Backend endpoints:
- GET /api/shops - List all shops
- GET /api/shops/:id - Get shop by ID
- POST /api/shops - Create shop
- PUT /api/shops/:id - Update shop
- DELETE /api/shops/:id - Delete shop

Files to update:
- src/pages/superadmin/Shops.tsx

Requirements:
1. CRUD for shops
2. View shop statistics
3. Manage shop admins
4. Shop settings and configuration
```

---

## Implementation Notes for Each Phase

### Before starting each phase:
1. Read the existing code in the files mentioned
2. Check src/lib/api.ts for any existing API methods
3. Check src/lib/queryClient.ts for query/mutation helpers
4. Look at working examples (like SaleManagers.tsx)

### Pattern to follow:
```typescript
// For fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/endpoint']
});

// For mutations
const mutation = useMutation({
  mutationFn: async (data) => {
    return apiRequest('POST', '/api/endpoint', data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/endpoint'] });
    toast({ title: 'Success' });
  },
  onError: (error) => {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }
});
```

### Testing each phase:
1. Check browser console for API errors
2. Check Network tab for correct requests
3. Verify data displays correctly
4. Test create/update/delete operations
5. Check loading states work
6. Verify error handling
