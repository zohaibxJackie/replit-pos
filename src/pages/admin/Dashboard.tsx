import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import SalesAnalyticsChart from '@/components/SalesAnalyticsChart';
import DevicesInRepair from '@/components/DevicesInRepair';
import LastSales from '@/components/LastSales';
import LowStockAlert from '@/components/LowStockAlert';
import { DollarSign, Wrench, Package, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useTitle } from '@/context/TitleContext';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface TodaySalesResponse {
  sales: Array<{
    id: string;
    total: string;
    createdAt: string;
    customerId?: string;
    paymentMethod: string;
  }>;
  summary: {
    totalAmount: string;
    saleCount: number;
  };
}

interface ProductsResponse {
  products: Array<{
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  }>;
  pagination: {
    total: number;
  };
}

interface RepairJobsResponse {
  repairJobs: Array<{ id: string }>;
  pagination: {
    total: number;
  };
}

interface CustomersResponse {
  customers: Array<{ id: string }>;
  pagination: {
    total: number;
  };
}

export default function AdminDashboard() {
  useAuth("adminDashboard");
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle('Shop Dashboard');
    return () => setTitle('Business Dashboard');
  }, [setTitle]);

  const { data: todaySalesData, isLoading: salesLoading } = useQuery<TodaySalesResponse>({
    queryKey: ['/api/sales/today']
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<ProductsResponse>({
    queryKey: ['/api/products']
  });

  const { data: repairsData, isLoading: repairsLoading } = useQuery<RepairJobsResponse>({
    queryKey: ['/api/repairs/jobs', { status: 'pending,in_progress,diagnosed,waiting_parts' }]
  });

  const { data: customersData, isLoading: customersLoading } = useQuery<CustomersResponse>({
    queryKey: ['/api/customers']
  });

  const todaySales = todaySalesData?.summary?.totalAmount 
    ? parseFloat(todaySalesData.summary.totalAmount) 
    : 0;
  
  const totalStock = productsData?.pagination?.total || 0;
  const activeRepairs = repairsData?.pagination?.total || 0;
  const totalCustomers = customersData?.pagination?.total || 0;
  
  const isLoading = salesLoading || productsLoading || repairsLoading || customersLoading;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              title={t('admin.dashboard.cards.sales.title') || 'Today Sales'}
              value={`$${todaySales.toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: 12.5, isPositive: true }}
              gradient="from-teal-500 to-emerald-600"
            />
            <StatCard
              title="Active Repairs"
              value={activeRepairs}
              icon={Wrench}
              gradient="from-blue-600 to-indigo-600"
            />
            <StatCard
              title={t('admin.dashboard.cards.stock.title') || 'Total Products'}
              value={totalStock}
              icon={Package}
              gradient="from-purple-600 to-pink-600"
            />
            <StatCard
              title="Total Customers"
              value={totalCustomers}
              icon={Users}
              gradient="from-amber-500 to-orange-600"
            />
          </>
        )}
      </div>

      {/* Sales Analytics */}
      <SalesAnalyticsChart />

      {/* Devices + Last Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DevicesInRepair />
        <div className="space-y-6">
          <LastSales
            title={t('admin.dashboard.last_sales.title') || 'Last Sales'}
            onViewAll={() => setLocation('/admin/sales')}
          />
        </div>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />
    </div>
  );
}
