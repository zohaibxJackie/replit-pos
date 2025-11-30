import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Store, Package, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";

type PurchaseOrder = {
  id: number;
  orderNumber: string;
  wholesalerName: string;
  wholesalerPhone: string;
  wholesalerWhatsapp: string;
  wholesalerEmail?: string;
  items: { productName: string; quantity: number; price: number; total: number }[];
  subtotal: number;
  total: number;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  notes?: string;
  wholesalerResponse?: string;
  createdAt: Date;
};

export default function AdminPurchaseOrders() {
  useAuth("adminPurchaseOrders");
  const { setTitle } = useTitle();
  const { toast } = useToast();

  useEffect(() => {
    setTitle("My Purchase Orders");
    return () => setTitle("Dashboard");
  }, [setTitle]);

  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { 
      id: 1, 
      orderNumber: "PO-2025-001", 
      wholesalerName: "TechWholesale Co.", 
      wholesalerPhone: "+92-300-1234567",
      wholesalerWhatsapp: "+92-300-1234567",
      wholesalerEmail: "sales@techwholesale.pk",
      items: [
        { productName: "iPhone 15 Pro Cases (Bulk)", quantity: 2, price: 10800, total: 21600 }
      ], 
      subtotal: 21600,
      total: 21600, 
      status: "approved",
      wholesalerResponse: "Order confirmed. Will ship within 2 days with tracking number.",
      notes: "Need these urgently for customer orders",
      createdAt: new Date("2025-01-10")
    },
    { 
      id: 2, 
      orderNumber: "PO-2025-002", 
      wholesalerName: "BulkTech Supplies", 
      wholesalerPhone: "+92-321-9876543",
      wholesalerWhatsapp: "+92-321-9876543",
      items: [
        { productName: "USB-C Premium Cables (Bulk)", quantity: 3, price: 20400, total: 61200 }
      ],
      subtotal: 61200,
      total: 61200, 
      status: "pending",
      notes: "Preferred payment via bank transfer",
      createdAt: new Date("2025-01-11")
    },
    { 
      id: 3, 
      orderNumber: "PO-2025-003", 
      wholesalerName: "MegaStock Electronics", 
      wholesalerPhone: "+92-333-5554444",
      wholesalerWhatsapp: "+92-333-5554444",
      wholesalerEmail: "orders@megastock.pk",
      items: [
        { productName: "10000mAh Power Banks (Bulk)", quantity: 5, price: 36000, total: 180000 }
      ],
      subtotal: 180000,
      total: 180000, 
      status: "rejected",
      wholesalerResponse: "Sorry, this product is currently out of stock. Will be available next week.",
      createdAt: new Date("2025-01-09")
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      approved: orders.filter(o => o.status === "approved").length,
      rejected: orders.filter(o => o.status === "rejected").length,
    };
  }, [orders]);

  const openWhatsApp = (number: string, wholesalerName: string, orderNumber: string) => {
    const message = encodeURIComponent(`Hello! This is regarding purchase order ${orderNumber} I placed with ${wholesalerName}.`);
    window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: "outline" as const, icon: Clock, color: "text-amber-600" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      fulfilled: { variant: "secondary" as const, icon: CheckCircle, color: "text-blue-600" },
    };
    
    const { variant, icon: Icon, color } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className={`w-3 h-3 ${color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Purchase Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track your orders sent to wholesalers</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          data-testid="filter-all"
        >
          All ({statusCounts.all})
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
          data-testid="filter-pending"
        >
          <Clock className="w-4 h-4 mr-2" />
          Pending ({statusCounts.pending})
        </Button>
        <Button
          variant={statusFilter === "approved" ? "default" : "outline"}
          onClick={() => setStatusFilter("approved")}
          data-testid="filter-approved"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Approved ({statusCounts.approved})
        </Button>
        <Button
          variant={statusFilter === "rejected" ? "default" : "outline"}
          onClick={() => setStatusFilter("rejected")}
          data-testid="filter-rejected"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rejected ({statusCounts.rejected})
        </Button>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className={`${
            order.status === "pending" ? "bg-amber-50/50 dark:bg-amber-950/10" :
            order.status === "approved" ? "bg-green-50/50 dark:bg-green-950/10" :
            order.status === "rejected" ? "bg-red-50/50 dark:bg-red-950/10" :
            "bg-blue-50/50 dark:bg-blue-950/10"
          }`} data-testid={`order-card-${order.id}`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                    {order.orderNumber}
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-base">{order.wholesalerName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {order.createdAt.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Wholesaler Phone</p>
                  <p className="font-semibold">{order.wholesalerPhone}</p>
                </div>
                {order.wholesalerEmail && (
                  <div>
                    <p className="text-sm text-muted-foreground">Wholesaler Email</p>
                    <p className="font-semibold text-sm break-all">{order.wholesalerEmail}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg bg-background">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × Rs. {item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-lg">Rs. {item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Your Notes</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{order.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.wholesalerResponse && (
                <div className={`p-4 border rounded-lg ${
                  order.status === "approved" 
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-4 h-4 mt-0.5 ${
                      order.status === "approved" 
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`} />
                    <div>
                      <p className={`font-semibold text-sm ${
                        order.status === "approved" 
                          ? "text-green-900 dark:text-green-100"
                          : "text-red-900 dark:text-red-100"
                      }`}>
                        Wholesaler Response
                      </p>
                      <p className={`text-sm ${
                        order.status === "approved" 
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}>
                        {order.wholesalerResponse}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => openWhatsApp(order.wholesalerWhatsapp, order.wholesalerName, order.orderNumber)}
                className="w-full sm:w-auto"
                data-testid={`button-whatsapp-${order.id}`}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact Wholesaler
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No purchase orders</h3>
          <p className="text-muted-foreground">
            {statusFilter === "all" 
              ? "You haven't placed any purchase orders yet." 
              : `No ${statusFilter} orders found.`}
          </p>
        </div>
      )}
    </div>
  );
}
