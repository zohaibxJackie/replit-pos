export const AccessControl = {
  pages: {
    superAdminDashboard: ["super_admin"],
    superAdminAdmins: ["super_admin"],
    superAdminShops: ["super_admin"],
    superAdminUsers: ["super_admin"],
    superAdminPricing: ["super_admin"],
    superAdminFeatureFlags: ["super_admin"],
    superAdminActivityLogs: ["super_admin"],
    superAdminAnalytics: ["super_admin"],

    adminDashboard: ["admin"],
    adminActivityLogs: ["admin"],
    adminCloseTodayTurn: ["admin"],
    adminDrawerHistory: ["admin"],
    adminPrivateWallet: ["admin"],
    adminPurchaseOrders: ["admin"],
    adminRechargePayments: ["admin"],
    adminRepairBook: ["admin"],
    adminRepairMen: ["admin"],
    adminSaleManagers: ["admin"],
    adminSales: ["admin"],
    adminSubscription: ["admin"],
    adminWholesalers: ["admin"],
    adminWholesalersMarketplace: ["admin"],

    adminReportsAvailableStock: ["admin"],
    adminReportsContractsReport: ["admin"],
    adminReportsGenericLowStock: ["admin"],
    adminReportsGenericProducts: ["admin"],
    adminReportsInvoices: ["admin"],
    adminReportsMobileLowStock: ["admin"],
    adminReportsMobileRecord: ["admin"],
    adminReportsNetProfit: ["admin"],
    adminReportsSaleReturn: ["admin"],
    adminReportsSales: ["admin"],
    adminReportsStockSold: ["admin"],
    adminReportsTopMobileSales: ["admin"],

    adminCustomer: ["admin", "sales_person"],
    adminProviders: ["admin", "sales_person"],
    catalogAddProduct: ["admin", "sales_person"],
    catalogCategory: ["admin", "sales_person"],
    catalogGeneric: ["admin", "sales_person"],
    catalogManageReasons: ["admin", "sales_person"],
    catalogManageStock: ["admin", "sales_person"],
    catalogProducts: ["admin", "sales_person"],
    catalogTax: ["admin", "sales_person"],

    pos: ["admin", "sales_person"],
    posProducts: ["sales_person"],
    posSales: ["sales_person"],

    repairManDashboard: ["repair_man"],
    repairManJobDetails: ["repair_man"],
    repairManPartsInventory: ["repair_man"],
    repairManReports: ["repair_man"],
    repairManServices: ["repair_man"],

    wholesalerDashboard: ["wholesaler"],
    wholesalerCustomers: ["wholesaler"],
    wholesalerInvoices: ["wholesaler"],
    wholesalerOrders: ["wholesaler"],
    wholesalerProducts: ["wholesaler"],
    wholesalerPurchaseOrders: ["wholesaler"],
    wholesalerReports: ["wholesaler"],
    wholesalerSalesOrders: ["wholesaler"],
    wholesalerSuppliers: ["wholesaler"],

    profile: ["admin", "super_admin", "sales_person", "repair_man", "wholesaler"],
  },

  components: {
    // These are example buttons
    deleteButton: ["admin", "super_admin"],
    exportButton: ["admin", "sales_person"],
    editProductButton: ["admin", "super_admin"],
    addRepairJobButton: ["admin"],
    manageStaffButton: ["admin"],
  },
};

export type PageKey = keyof typeof AccessControl.pages;
export type ComponentKey = keyof typeof AccessControl.components;

export function canAccessPage(userRole: string | undefined, pageKey: PageKey): boolean {
  if (!userRole) return false;
  const allowedRoles = AccessControl.pages[pageKey];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

export function canAccessComponent(userRole: string | undefined, componentKey: ComponentKey): boolean {
  if (!userRole) return false;
  const allowedRoles = AccessControl.components[componentKey];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

export function canAccess(userRole: string | undefined, key: PageKey | ComponentKey): boolean {
  if (!userRole) return false;
  
  if (key in AccessControl.pages) {
    return canAccessPage(userRole, key as PageKey);
  }
  
  if (key in AccessControl.components) {
    return canAccessComponent(userRole, key as ComponentKey);
  }
  
  return false;
}

export function getDefaultRedirectForRole(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'sales_person':
      return '/pos';
    case 'repair_man':
      return '/repair-man/dashboard';
    case 'wholesaler':
      return '/wholesaler/dashboard';
    default:
      return '/login';
  }
}
