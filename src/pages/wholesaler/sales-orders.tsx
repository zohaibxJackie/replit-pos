import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WholesalerSalesOrders() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setTitle("Sales Orders");
  }, [setTitle]);

  const orders = [
    {
      id: "1",
      orderNumber: "SO-2024-001",
      customer: "Tech Solutions Inc.",
      date: "2024-01-20",
      items: 5,
      totalAmount: "$2,450.00",
      status: "pending",
      paymentStatus: "unpaid",
    },
    {
      id: "2",
      orderNumber: "SO-2024-002",
      customer: "Global Electronics Ltd.",
      date: "2024-01-19",
      items: 12,
      totalAmount: "$5,890.00",
      status: "processing",
      paymentStatus: "partial",
    },
    {
      id: "3",
      orderNumber: "SO-2024-003",
      customer: "Retail Pro Store",
      date: "2024-01-18",
      items: 8,
      totalAmount: "$3,200.00",
      status: "shipped",
      paymentStatus: "paid",
    },
    {
      id: "4",
      orderNumber: "SO-2024-004",
      customer: "Smart Devices Co.",
      date: "2024-01-17",
      items: 15,
      totalAmount: "$8,750.00",
      status: "delivered",
      paymentStatus: "paid",
    },
    {
      id: "5",
      orderNumber: "SO-2024-005",
      customer: "Office Supplies Plus",
      date: "2024-01-16",
      items: 6,
      totalAmount: "$1,980.00",
      status: "cancelled",
      paymentStatus: "refunded",
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "partial":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "unpaid":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "refunded":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Pending Orders",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Completed Orders",
      value: orders.filter((o) => o.status === "delivered").length.toString(),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Revenue",
      value: "$22,270",
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Orders</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: "Create Order",
              description: "Order creation feature coming soon",
            })
          }
          data-testid="button-create-order"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    data-testid={`button-filter-${status}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} data-testid={`card-order-${order.id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-semibold text-lg"
                        data-testid={`text-order-number-${order.id}`}
                      >
                        {order.orderNumber}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getStatusColor(order.status)}
                        data-testid={`badge-status-${order.id}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getPaymentColor(order.paymentStatus)}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="text-sm font-medium">{order.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <p className="text-sm font-medium">{order.items}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="text-sm font-medium">
                          {order.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "View Order",
                          description: `Viewing order ${order.orderNumber}`,
                        })
                      }
                      data-testid={`button-view-${order.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
