import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import { useAuthStore } from "@/store/authStore";
import NotFound from "@/pages/not-found";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Profile from "@/pages/Profile";

import { TitleProvider } from "@/context/TitleContext";

import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import ManageAdmins from "@/pages/superadmin/Admins";
import PricingPlans from "@/pages/superadmin/Pricing";
import SystemAnalytics from "@/pages/superadmin/Analytics";
import ShopManagement from "@/pages/superadmin/Shops";
import UserManagement from "@/pages/superadmin/Users";
import FeatureFlags from "@/pages/superadmin/FeatureFlags";
import ActivityLogs from "@/pages/superadmin/ActivityLogs";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClients from "@/pages/admin/Customer";
import Providers from "./pages/admin/Providers";
import GenericProducts from "./pages/admin/sub pages/Generic";
import RepairBook from "@/pages/admin/RepairBook";
import CloseTodayTurn from "@/pages/admin/CloseTodayTurn";
import SalesDetailPage from "./pages/admin/SalesDetailPage";
import PrivateWallet from "@/pages/admin/PrivateWallet";
import RechargePayments from "@/pages/admin/RechargePayment";
import Products from "@/pages/admin/sub pages/Products";
import Category from "./pages/admin/sub pages/Category";
import AdminActivityLogs from "@/pages/admin/ActivityLogs";
import DrawerOpenHistory from "@/pages/admin/DrawerOpenHistory";
import SalesReport from "./pages/admin/reports/SalesReport";
import AvailableStockReport from "./pages/admin/reports/AvailableStockReport";
import StockSoldReport from "./pages/admin/reports/StockSoldReport";
import GenericProductsReport from "./pages/admin/reports/GenericProductsReport";
import InvoicesReport from "./pages/admin/reports/InvoicesReport";
import ContractsReport from "./pages/admin/reports/ContractsReport";
import TopMobileSalesReport from "./pages/admin/reports/TopMobileSalesReport";
import MobileRecordReport from "./pages/admin/reports/MobileRecordReport";
import MobileLowStockReport from "./pages/admin/reports/MobileLowStockReport";
import GenericLowStockReport from "./pages/admin/reports/GenericLowStockReport";
import NetProfitReport from "./pages/admin/reports/NetProfitReport";
import SaleReturnReport from "./pages/admin/reports/SaleReturnReport";
import Subscription from "@/pages/admin/Subscription";
import SalesManagers from "@/pages/admin/SaleManagers";
import AdminShops from "@/pages/admin/Shops";

import POS from "@/pages/pos/POS";
import RecentSales from "@/pages/pos/Sales";
import POSProducts from "@/pages/pos/Products";
import ManageReasons from "./pages/admin/sub pages/ManageReasons";
import ManageStock from "./pages/admin/sub pages/ManageStock";

import RepairManDashboard from "@/pages/repairman/dashboard";
import RepairManServices from "@/pages/repairman/services";
import RepairManJobDetails from "@/pages/repairman/job-details";
import RepairManReports from "@/pages/repairman/reports";
import RepairManPartsInventory from "@/pages/repairman/parts-inventory";
import WholesalerDashboard from "@/pages/wholesaler/Dashboard";
import WholesalerProducts from "@/pages/wholesaler/products";
import WholesalerOrders from "@/pages/wholesaler/Orders";
import WholesalerCustomers from "@/pages/wholesaler/customers";
import WholesalerInvoices from "@/pages/wholesaler/invoices";
import WholesalerReports from "@/pages/wholesaler/reports";
import RepairMen from "@/pages/admin/RepairMen";
import Wholesalers from "@/pages/admin/Wholesalers";
import WholesalersMarketplace from "@/pages/admin/WholesalersMarketplace";
import AdminPurchaseOrders from "@/pages/admin/PurchaseOrders";
import Tax from "./pages/admin/sub pages/Tax";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const style = {
    "--sidebar-width": "17.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background rtl:flex-row-reverse">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {!isAuthenticated && (
        <Route path="/">
          <Redirect to="/login" />
        </Route>
      )}
      {/* Super admin routes */}
      <Route path="/super-admin/dashboard">
        <ProtectedLayout>
          <SuperAdminDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/admins">
        <ProtectedLayout>
          <ManageAdmins />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/shops">
        <ProtectedLayout>
          <ShopManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/users">
        <ProtectedLayout>
          <UserManagement />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/pricing">
        <ProtectedLayout>
          <PricingPlans />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/feature-flags">
        <ProtectedLayout>
          <FeatureFlags />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/activity-logs">
        <ProtectedLayout>
          <ActivityLogs />
        </ProtectedLayout>
      </Route>
      <Route path="/super-admin/analytics">
        <ProtectedLayout>
          <SystemAnalytics />
        </ProtectedLayout>
      </Route>

      {/* Admin routes */}
      <Route path="/admin/dashboard">
        <ProtectedLayout>
          <AdminDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/customer">
        <ProtectedLayout>
          <AdminClients />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/providers">
        <ProtectedLayout>
          <Providers />
        </ProtectedLayout>
      </Route>
      <Route path="/catalog/categories">
        <ProtectedLayout>
          <Category />
        </ProtectedLayout>
      </Route>
      <Route path="/catalog/manage-reasons">
        <ProtectedLayout>
          <ManageReasons />
        </ProtectedLayout>
      </Route>
      <Route path="/catalog/manage-stock">
        <ProtectedLayout>
          <ManageStock />
        </ProtectedLayout>
      </Route>
      <Route path="/catalog/tax">
        <ProtectedLayout>
          <Tax />
        </ProtectedLayout>
      </Route>
      <Route path="/products/mobile">
        <ProtectedLayout>
          <Products />
        </ProtectedLayout>
      </Route>
      <Route path="/products/generic">
        <ProtectedLayout>
          <GenericProducts />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/repair-book">
        <ProtectedLayout>
          <RepairBook />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/close-today-turn">
        <ProtectedLayout>
          <CloseTodayTurn />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/close-today-turn/:salespersonId">
        <ProtectedLayout>
          <SalesDetailPage />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/private-wallet">
        <ProtectedLayout>
          <PrivateWallet />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/recharge-payments">
        <ProtectedLayout>
          <RechargePayments />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/activity-logs">
        <ProtectedLayout>
          <AdminActivityLogs />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/sales">
        <ProtectedLayout>
          <SalesReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/available-stock">
        <ProtectedLayout>
          <AvailableStockReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/stock-sold">
        <ProtectedLayout>
          <StockSoldReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/generic-products">
        <ProtectedLayout>
          <GenericProductsReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/invoices">
        <ProtectedLayout>
          <InvoicesReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/contracts">
        <ProtectedLayout>
          <ContractsReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/top-mobile-sales">
        <ProtectedLayout>
          <TopMobileSalesReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/mobile-record">
        <ProtectedLayout>
          <MobileRecordReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/mobile-low-stock">
        <ProtectedLayout>
          <MobileLowStockReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/generic-low-stock">
        <ProtectedLayout>
          <GenericLowStockReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/net-profit">
        <ProtectedLayout>
          <NetProfitReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/reports/sale-return">
        <ProtectedLayout>
          <SaleReturnReport />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/drawer-history">
        <ProtectedLayout>
          <DrawerOpenHistory />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/subscription">
        <ProtectedLayout>
          <Subscription />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/sale-managers">
        <ProtectedLayout>
          <SalesManagers />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/shops">
        <ProtectedLayout>
          <AdminShops />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/repair-men">
        <ProtectedLayout>
          <RepairMen />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/wholesalers">
        <ProtectedLayout>
          <Wholesalers />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/wholesalers/marketplace">
        <ProtectedLayout>
          <WholesalersMarketplace />
        </ProtectedLayout>
      </Route>
      <Route path="/admin/purchase-orders">
        <ProtectedLayout>
          <AdminPurchaseOrders />
        </ProtectedLayout>
      </Route>

      {/* POS routes */}
      <Route path="/pos">
        <ProtectedLayout>
          <POS />
        </ProtectedLayout>
      </Route>
      <Route path="/pos/sales">
        <ProtectedLayout>
          <RecentSales />
        </ProtectedLayout>
      </Route>
      <Route path="/pos/products">
        <ProtectedLayout>
          <POSProducts />
        </ProtectedLayout>
      </Route>

      {/* Repair Man routes */}
      <Route path="/repair-man/dashboard">
        <ProtectedLayout>
          <RepairManDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/repair-man/services">
        <ProtectedLayout>
          <RepairManServices />
        </ProtectedLayout>
      </Route>
      <Route path="/repair-man/job/:id">
        <ProtectedLayout>
          <RepairManJobDetails />
        </ProtectedLayout>
      </Route>
      <Route path="/repair-man/reports">
        <ProtectedLayout>
          <RepairManReports />
        </ProtectedLayout>
      </Route>
      <Route path="/repair-man/parts-inventory">
        <ProtectedLayout>
          <RepairManPartsInventory />
        </ProtectedLayout>
      </Route>

      {/* Wholesaler routes */}
      <Route path="/wholesaler/dashboard">
        <ProtectedLayout>
          <WholesalerDashboard />
        </ProtectedLayout>
      </Route>
      <Route path="/wholesaler/products">
        <ProtectedLayout>
          <WholesalerProducts />
        </ProtectedLayout>
      </Route>
      <Route path="/wholesaler/orders">
        <ProtectedLayout>
          <WholesalerOrders />
        </ProtectedLayout>
      </Route>
      <Route path="/wholesaler/customers">
        <ProtectedLayout>
          <WholesalerCustomers />
        </ProtectedLayout>
      </Route>
      <Route path="/wholesaler/invoices">
        <ProtectedLayout>
          <WholesalerInvoices />
        </ProtectedLayout>
      </Route>
      <Route path="/wholesaler/reports">
        <ProtectedLayout>
          <WholesalerReports />
        </ProtectedLayout>
      </Route>

      {/* Profile route - accessible by all authenticated users */}
      <Route path="/profile">
        <ProtectedLayout>
          <Profile />
        </ProtectedLayout>
      </Route>

      <Route path="/">
        <Redirect to="/login" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TitleProvider defaultTitle="Business Dashboard">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </TitleProvider>
    </QueryClientProvider>
  );
}
