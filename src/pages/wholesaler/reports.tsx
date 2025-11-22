import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Calendar,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function WholesalerReports() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("this_month");

  useEffect(() => {
    setTitle("Reports & Analytics");
  }, [setTitle]);

  const stats = [
    {
      title: "Total Revenue",
      value: "$214,870",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Orders",
      value: "182",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Products Sold",
      value: "1,247",
      change: "+15.3%",
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Customers",
      value: "48",
      change: "+6.7%",
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  const topProducts = [
    {
      name: "Premium Wireless Mouse",
      revenue: "$7,225",
      units: 85,
      growth: "+18%",
    },
    {
      name: "Wireless Earbuds Pro",
      revenue: "$6,460",
      units: 95,
      growth: "+22%",
    },
    {
      name: "USB-C Hub 7-in-1",
      revenue: "$5,400",
      units: 120,
      growth: "+15%",
    },
    {
      name: "Mechanical Keyboard RGB",
      revenue: "$5,040",
      units: 42,
      growth: "+12%",
    },
    {
      name: "Laptop Stand Aluminum",
      revenue: "$2,275",
      units: 65,
      growth: "+8%",
    },
  ];

  const topCustomers = [
    {
      name: "Smart Devices Co.",
      orders: 65,
      revenue: "$78,500",
      growth: "+25%",
    },
    {
      name: "Tech Solutions Inc.",
      orders: 45,
      revenue: "$52,450",
      growth: "+18%",
    },
    {
      name: "Global Electronics Ltd.",
      orders: 32,
      revenue: "$38,920",
      growth: "+12%",
    },
    {
      name: "Retail Pro Store",
      orders: 28,
      revenue: "$29,800",
      growth: "+8%",
    },
    {
      name: "Office Supplies Plus",
      orders: 12,
      revenue: "$15,200",
      growth: "+5%",
    },
  ];

  const categoryBreakdown = [
    {
      category: "Electronics",
      revenue: "$95,400",
      percentage: 44,
      color: "bg-blue-500",
    },
    {
      category: "Accessories",
      revenue: "$64,200",
      percentage: 30,
      color: "bg-purple-500",
    },
    {
      category: "Audio",
      revenue: "$42,870",
      percentage: 20,
      color: "bg-green-500",
    },
    {
      category: "Computing",
      revenue: "$12,400",
      percentage: 6,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.color}>{stat.change}</span> from last
                  period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[180px]"
              data-testid="select-time-range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Export Report",
                description: "Report export feature coming soon",
              })
            }
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-top-products">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.units} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.revenue}</p>
                    <p className="text-xs text-green-500">{product.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-top-customers">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.orders} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{customer.revenue}</p>
                    <p className="text-xs text-green-500">{customer.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-category-breakdown">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryBreakdown.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {category.category}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {category.revenue} ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`${category.color} h-2 rounded-full`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-monthly-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Average Order Value
              </p>
              <p className="text-2xl font-bold">$1,180</p>
              <p className="text-xs text-green-500">+8.3% from last month</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Order Fulfillment Rate
              </p>
              <p className="text-2xl font-bold">97.5%</p>
              <p className="text-xs text-green-500">+2.1% from last month</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Customer Retention
              </p>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-xs text-green-500">+4.5% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
