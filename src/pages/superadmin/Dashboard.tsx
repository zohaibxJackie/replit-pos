import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import { Users, Store, DollarSign, TrendingUp } from 'lucide-react';

export default function SuperAdminDashboard() {
  useAuth("superAdminDashboard");

  //todo: remove mock functionality
  const stats = {
    totalAdmins: 24,
    totalShops: 24,
    totalRevenue: 2890.50,
    activeUsers: 156,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
          gradient="bg-gradient-to-br from-primary to-chart-2"
        />
        <StatCard
          title="Total Shops"
          value={stats.totalShops}
          icon={Store}
          trend={{ value: 8.3, isPositive: true }}
          gradient="bg-gradient-to-br from-chart-3 to-primary"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 15.2, isPositive: true }}
          gradient="bg-gradient-to-br from-chart-4 to-chart-3"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={TrendingUp}
          trend={{ value: 23.1, isPositive: true }}
          gradient="bg-gradient-to-br from-chart-2 to-chart-1"
        />
      </div>
    </div>
  );
}
