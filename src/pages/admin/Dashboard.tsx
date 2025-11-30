import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import SalesAnalyticsChart from '@/components/SalesAnalyticsChart';
import DevicesInRepair from '@/components/DevicesInRepair';
import LastSales from '@/components/LastSales';
import LowStockAlert from '@/components/LowStockAlert';
import { DollarSign, Wallet, Package, CreditCard, ArrowDownCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useTitle } from '@/context/TitleContext';
import { useEffect, useMemo, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AdminDashboard() {
  useAuth("adminDashboard");
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  // --- shops (mock) ---
  const shops = [
    { id: 'all', name: 'All Shops' },
    { id: 'main', name: 'Main Store' },
    { id: 'outlet_1', name: 'Outlet 1' },
    { id: 'outlet_2', name: 'Outlet 2' },
  ];

  // selected shop state
  const [selectedShop, setSelectedShop] = useState<string>('all');

  // Mock per-shop stats (in a real app these would come from an API)
  const mockPerShopStats: Record<string, { todaySales: number; walletBalance: number; totalStock: number; clientsCredit: number }> = {
    all: { todaySales: 1250.5, walletBalance: 8750.25, totalStock: 1256, clientsCredit: 3420.0 },
    main: { todaySales: 850.75, walletBalance: 5200.5, totalStock: 720, clientsCredit: 2100.0 },
    outlet_1: { todaySales: 250.0, walletBalance: 1800.75, totalStock: 320, clientsCredit: 800.0 },
    outlet_2: { todaySales: 149.75, walletBalance: 1749.0, totalStock: 216, clientsCredit: 520.0 },
  };

  // derive stats for selected shop
  const stats = useMemo(() => {
    return mockPerShopStats[selectedShop] ?? mockPerShopStats['all'];
  }, [selectedShop]);

  useEffect(() => {
    setTitle('Shop Dashboard'); // set header title for this page
    return () => setTitle('Business Dashboard'); // optional reset on unmount
  }, [setTitle]);

  return (
    <div className="space-y-6">
      {/* Header: title + shop selector */}
      <div className="flex items-center justify-end gap-4">        
        {/* Shop selector */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 mr-2">Viewing:</div>
          <Select value={selectedShop} onValueChange={(v) => setSelectedShop(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shops.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('admin.dashboard.cards.sales.title') || 'Today Sales'}
          value={`$${stats.todaySales.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          gradient="from-teal-500 to-emerald-600"
        />
        <StatCard
          title={t('admin.dashboard.cards.wallet.title') || 'Wallet'}
          value={`$${stats.walletBalance.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 8.2, isPositive: true }}
          gradient="from-blue-600 to-indigo-600"
        />
        <StatCard
          title={t('admin.dashboard.cards.stock.title') || 'Total Stock'}
          value={stats.totalStock}
          icon={Package}
          trend={{ value: 15.3, isPositive: true }}
          gradient="from-purple-600 to-pink-600"
        />
        <StatCard
          title={t('admin.dashboard.cards.clients_credit.title') || 'Clients Credit'}
          value={`$${stats.clientsCredit.toLocaleString()}`}
          icon={CreditCard}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          title={t('admin.dashboard.cards.expense.title') || 'Expense'}
          value={`$${stats.clientsCredit.toLocaleString()}`}
          icon={ArrowDownCircle}
          gradient="from-red-400 to-red-600"
        />
      </div>

      {/* Sales Analytics */}
      {/* NOTE: SalesAnalyticsChart could accept a prop like `shopId={selectedShop}` to fetch shop-specific data */}
      <SalesAnalyticsChart /* shopId={selectedShop} */ />

      {/* Devices + Last Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DevicesInRepair could also take shopId to show per-shop devices */}
        <DevicesInRepair /* shopId={selectedShop} */ />
        <div className="space-y-6">
          <LastSales
            title={t('admin.dashboard.last_sales.title') || 'Last Sales'}
            onViewAll={() => setLocation('/admin/sales')}
            shopId={selectedShop} // passing for later wiring
          />
        </div>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert shopId={selectedShop} />
    </div>
  );
}
