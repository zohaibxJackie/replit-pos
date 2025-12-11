import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import SalesAnalyticsChart from '@/components/SalesAnalyticsChart';
import DevicesInRepair from '@/components/DevicesInRepair';
import LastSales from '@/components/LastSales';
import LowStockAlert from '@/components/LowStockAlert';
import { DollarSign, Wrench, Package, Users, CalendarIcon, Building2, RotateCcw } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useTitle } from '@/context/TitleContext';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import type { Shop } from '@shared/schema';

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

interface MyShopsResponse {
  shops: Shop[];
  maxShops: number;
  canAddMore: boolean;
}

type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisWeek' | 'thisMonth' | 'custom';

export default function AdminDashboard() {
  useAuth("adminDashboard");
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case 'last7days':
        return { from: startOfDay(subDays(now, 7)), to: endOfDay(now) };
      case 'last30days':
        return { from: startOfDay(subDays(now, 30)), to: endOfDay(now) };
      case 'thisWeek':
        return { from: startOfWeek(now), to: endOfDay(now) };
      case 'thisMonth':
        return { from: startOfMonth(now), to: endOfDay(now) };
      case 'custom':
        return customDateRange;
      default:
        return { from: startOfDay(now), to: endOfDay(now) };
    }
  };

  const dateRange = getDateRange();

  useEffect(() => {
    setTitle(t('admin.dashboard.title') || 'Shop Dashboard');
    return () => setTitle(t('admin.common.dashboard') || 'Dashboard');
  }, [setTitle, t]);

  const { data: shopsData, isLoading: shopsLoading } = useQuery<MyShopsResponse>({
    queryKey: ['/api/shops/my-shops']
  });

  const shops = shopsData?.shops || [];
  const hasMultipleShops = shops.length > 1;

  const buildQueryString = (params: Record<string, string | undefined>) => {
    const entries = Object.entries(params).filter(([_, v]) => v !== undefined && v !== 'all');
    if (entries.length === 0) return '';
    return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&');
  };

  const salesQueryParams = buildQueryString({
    shopId: selectedShopId !== 'all' ? selectedShopId : undefined,
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString()
  });

  const { data: todaySalesData, isLoading: salesLoading } = useQuery<TodaySalesResponse>({
    queryKey: [`/api/sales/today${salesQueryParams}`]
  });

  const productQueryParams = buildQueryString({
    shopId: selectedShopId !== 'all' ? selectedShopId : undefined
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<ProductsResponse>({
    queryKey: [`/api/products${productQueryParams}`]
  });

  const { data: repairsData, isLoading: repairsLoading } = useQuery<RepairJobsResponse>({
    queryKey: ['/api/repairs/jobs', { status: 'pending,in_progress,diagnosed,waiting_parts' }]
  });

  const { data: customersData, isLoading: customersLoading } = useQuery<CustomersResponse>({
    queryKey: ['/api/customers']
  });

  const handleResetFilters = () => {
    setSelectedShopId('all');
    setDatePreset('today');
    setCustomDateRange({ from: startOfDay(new Date()), to: endOfDay(new Date()) });
  };

  const todaySales = todaySalesData?.summary?.totalAmount 
    ? parseFloat(todaySalesData.summary.totalAmount) 
    : 0;
  
  const totalStock = productsData?.pagination?.total || 0;
  const activeRepairs = repairsData?.pagination?.total || 0;
  const totalCustomers = customersData?.pagination?.total || 0;
  
  const isLoading = salesLoading || productsLoading || repairsLoading || customersLoading || shopsLoading;

  const getDatePresetLabel = () => {
    switch (datePreset) {
      case 'today': return t('admin.dashboard.filters.date_presets.today') || 'Today';
      case 'yesterday': return t('admin.dashboard.filters.date_presets.yesterday') || 'Yesterday';
      case 'last7days': return t('admin.dashboard.filters.date_presets.last_7_days') || 'Last 7 Days';
      case 'last30days': return t('admin.dashboard.filters.date_presets.last_30_days') || 'Last 30 Days';
      case 'thisWeek': return t('admin.dashboard.filters.date_presets.this_week') || 'This Week';
      case 'thisMonth': return t('admin.dashboard.filters.date_presets.this_month') || 'This Month';
      case 'custom': 
        return `${format(customDateRange.from, 'MMM d')} - ${format(customDateRange.to, 'MMM d, yyyy')}`;
      default: return t('admin.dashboard.filters.select_date') || 'Select Date';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {hasMultipleShops && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                  <SelectTrigger className="w-[200px]" data-testid="select-shop-filter">
                    <SelectValue placeholder={t('admin.dashboard.filters.all_shops') || 'All Shops'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.dashboard.filters.all_shops') || 'All Shops'}</SelectItem>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <Select value={datePreset} onValueChange={(value) => setDatePreset(value as DatePreset)}>
                <SelectTrigger className="w-[160px]" data-testid="select-date-preset">
                  <SelectValue>{getDatePresetLabel()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('admin.dashboard.filters.date_presets.today') || 'Today'}</SelectItem>
                  <SelectItem value="yesterday">{t('admin.dashboard.filters.date_presets.yesterday') || 'Yesterday'}</SelectItem>
                  <SelectItem value="last7days">{t('admin.dashboard.filters.date_presets.last_7_days') || 'Last 7 Days'}</SelectItem>
                  <SelectItem value="last30days">{t('admin.dashboard.filters.date_presets.last_30_days') || 'Last 30 Days'}</SelectItem>
                  <SelectItem value="thisWeek">{t('admin.dashboard.filters.date_presets.this_week') || 'This Week'}</SelectItem>
                  <SelectItem value="thisMonth">{t('admin.dashboard.filters.date_presets.this_month') || 'This Month'}</SelectItem>
                  <SelectItem value="custom">{t('admin.dashboard.filters.date_presets.custom') || 'Custom Range'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {datePreset === 'custom' && (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px] justify-start text-left font-normal" data-testid="button-date-range">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(customDateRange.from, 'MMM d')} - {format(customDateRange.to, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={customDateRange.from}
                    selected={{ from: customDateRange.from, to: customDateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setCustomDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                  />
                  <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">{t("admin.sales_report.from")}</label>
              </div>
                </PopoverContent>
              </Popover>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters}
              className="ml-auto"
              data-testid="button-reset-filters"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('admin.dashboard.filters.reset') || 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
