//todo: remove mock functionality
export const mockCategories = [
  { id: 'cat1', shopId: 'shop1', name: 'Screen Repairs', createdAt: new Date('2024-01-01') },
  { id: 'cat2', shopId: 'shop1', name: 'Battery Replacement', createdAt: new Date('2024-01-01') },
  { id: 'cat3', shopId: 'shop1', name: 'Phone Accessories', createdAt: new Date('2024-01-01') },
  { id: 'cat4', shopId: 'shop1', name: 'Phone Cases', createdAt: new Date('2024-01-01') },
  { id: 'cat5', shopId: 'shop1', name: 'Chargers & Cables', createdAt: new Date('2024-01-01') },
];

export const mockProducts = [
  { id: 'prod1', shopId: 'shop1', name: 'iPhone 13 Screen', barcode: '123456789012', categoryId: 'cat1', price: '89.99', stock: 12, lowStockThreshold: 5, type: 'mobile', createdAt: new Date('2024-01-01') },
  { id: 'prod2', shopId: 'shop1', name: 'Samsung S21 Battery', barcode: '987654321', categoryId: 'cat2', price: '45.50', stock: 3, lowStockThreshold: 5, type: 'mobile', createdAt: new Date('2024-01-01') },
  { id: 'prod3', shopId: 'shop1', name: 'Phone Case Premium', barcode: '111222333', categoryId: 'cat4', price: '15.99', stock: 25, lowStockThreshold: 5, type: 'accessory', createdAt: new Date('2024-01-01') },
  { id: 'prod4', shopId: 'shop1', name: 'USB-C Cable', barcode: '444555666', categoryId: 'cat5', price: '12.99', stock: 8, lowStockThreshold: 5, type: 'accessory', createdAt: new Date('2024-01-01') },
  { id: 'prod5', shopId: 'shop1', name: 'Wireless Charger', barcode: '777888999', categoryId: 'cat5', price: '29.99', stock: 2, lowStockThreshold: 5, type: 'accessory', createdAt: new Date('2024-01-01') },
  { id: 'prod6', shopId: 'shop1', name: 'Screen Protector', barcode: '123123123', categoryId: 'cat3', price: '9.99', stock: 45, lowStockThreshold: 5, type: 'accessory', createdAt: new Date('2024-01-01') },
];

export const mockSales = [
  { id: 'sale1', shopId: 'shop1', salesPersonId: '3', subtotal: '100.00', tax: '10.00', discount: '5.00', total: '105.00', createdAt: new Date('2024-10-14T10:30:00') },
  { id: 'sale2', shopId: 'shop1', salesPersonId: '3', subtotal: '45.50', tax: '4.55', discount: '0.00', total: '50.05', createdAt: new Date('2024-10-14T11:15:00') },
  { id: 'sale3', shopId: 'shop1', salesPersonId: '3', subtotal: '150.00', tax: '15.00', discount: '10.00', total: '155.00', createdAt: new Date('2024-10-13T14:20:00') },
];

export const mockStaff = [
  { id: '3', username: 'sales', email: 'sales@shop.com', role: 'sales_person', shopId: 'shop1', createdAt: new Date('2024-01-01') },
  { id: '4', username: 'john_sales', email: 'john@shop.com', role: 'sales_person', shopId: 'shop1', createdAt: new Date('2024-02-01') },
  { id: '5', username: 'sarah_sales', email: 'sarah@shop.com', role: 'sales_person', shopId: 'shop1', createdAt: new Date('2024-03-01') },
];

export const mockAdmins = [
  { id: '2', username: 'admin', email: 'admin@shop.com', role: 'admin', shopId: 'shop1', shopName: 'TechFix Mobile Repair', subscriptionTier: 'gold', createdAt: new Date('2024-01-01') },
  { id: '6', username: 'phonerepair', email: 'contact@phonerepair.com', role: 'admin', shopId: 'shop2', shopName: 'QuickFix Phone Center', subscriptionTier: 'silver', createdAt: new Date('2024-02-15') },
  { id: '7', username: 'mobilehub', email: 'info@mobilehub.com', role: 'admin', shopId: 'shop3', shopName: 'Mobile Hub Solutions', subscriptionTier: 'platinum', createdAt: new Date('2024-03-20') },
];

export const mockPricingPlans = [
  { 
    id: 'plan1', 
    name: 'Silver', 
    price: '29.99', 
    maxStaff: 2, 
    maxProducts: 100, 
    features: ['Basic POS', 'Sales Reports', 'Email Support'],
    isActive: true 
  },
  { 
    id: 'plan2', 
    name: 'Gold', 
    price: '59.99', 
    maxStaff: 5, 
    maxProducts: 500, 
    features: ['Advanced POS', 'Advanced Analytics', 'Priority Support', 'Multi-user Access'],
    isActive: true 
  },
  { 
    id: 'plan3', 
    name: 'Platinum', 
    price: '99.99', 
    maxStaff: 15, 
    maxProducts: 2000, 
    features: ['Enterprise POS', 'Custom Reports', '24/7 Support', 'API Access', 'Unlimited Sales'],
    isActive: true 
  },
];
