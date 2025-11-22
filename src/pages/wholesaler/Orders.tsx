import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { ShoppingCart, Store, Package, Check, X, MessageSquare, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Order = {
  id: number;
  orderNumber: string;
  shopName?: string;
  salesPersonName?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  contactPerson: string;
  items: { productName: string; quantity: number; price: number; total: number }[];
  subtotal: number;
  total: number;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  notes?: string;
  wholesalerResponse?: string;
  createdAt: Date;
  orderType: "purchase_order" | "sales_order";
};

export default function WholesalerOrders() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setTitle("Orders");
    return () => setTitle("Dashboard");
  }, [setTitle]);

  const [orders, setOrders] = useState<Order[]>([
    { 
      id: 1, 
      orderNumber: "PO-2025-001", 
      shopName: "Tech Mobile Shop",
      orderType: "purchase_order",
      phone: "+92-300-1234567",
      whatsapp: "+92-300-1234567",
      email: "tech@mobileshop.pk",
      address: "Shop 123, Mobile Market, Karachi",
      contactPerson: "Ahmed Khan", 
      items: [
        { productName: "iPhone 15 Pro Cases (Bulk)", quantity: 2, price: 10800, total: 21600 },
        { productName: "USB-C Cables (Bulk)", quantity: 1, price: 20400, total: 20400 }
      ], 
      subtotal: 42000,
      total: 42000, 
      status: "pending",
      notes: "Need urgent delivery within 3 days",
      createdAt: new Date("2025-01-10")
    },
    { 
      id: 2, 
      orderNumber: "SO-2025-001", 
      salesPersonName: "Fatima Ahmed",
      orderType: "sales_order",
      phone: "+92-321-7654321",
      whatsapp: "+92-321-7654321",
      email: "fatima@sales.pk",
      contactPerson: "Fatima Ahmed", 
      items: [
        { productName: "Samsung Chargers (Bulk)", quantity: 3, price: 15000, total: 45000 }
      ],
      subtotal: 45000,
      total: 45000, 
      status: "pending",
      notes: "Sales person direct order for customer",
      createdAt: new Date("2025-01-11")
    },
    { 
      id: 3, 
      orderNumber: "PO-2025-002", 
      shopName: "Gadget Hub",
      orderType: "purchase_order",
      phone: "+92-333-9998888",
      whatsapp: "+92-333-9998888",
      contactPerson: "Hassan Ali", 
      items: [
        { productName: "Samsung Fast Chargers (Bulk)", quantity: 5, price: 18000, total: 90000 }
      ],
      subtotal: 90000,
      total: 90000, 
      status: "approved",
      wholesalerResponse: "Order confirmed. Will ship within 2 days.",
      createdAt: new Date("2025-01-09")
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseAction, setResponseAction] = useState<"approved" | "rejected" | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesType = typeFilter === "all" || order.orderType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [orders, statusFilter, typeFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      approved: orders.filter(o => o.status === "approved").length,
      rejected: orders.filter(o => o.status === "rejected").length,
      fulfilled: orders.filter(o => o.status === "fulfilled").length,
    };
  }, [orders]);

  const typeCounts = useMemo(() => {
    return {
      all: orders.length,
      purchase_order: orders.filter(o => o.orderType === "purchase_order").length,
      sales_order: orders.filter(o => o.orderType === "sales_order").length,
    };
  }, [orders]);

  const openResponseModal = (order: Order, action: "approved" | "rejected") => {
    setSelectedOrder(order);
    setResponseAction(action);
    setResponseMessage("");
    setIsResponseModalOpen(true);
  };

  const handleOrderAction = () => {
    if (!selectedOrder || !responseAction) return;

    setOrders(orders.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: responseAction, wholesalerResponse: responseMessage || undefined } 
        : order
    ));

    toast({ 
      title: responseAction === "approved" ? "Order Approved" : "Order Rejected",
      description: `Order ${selectedOrder.orderNumber} has been ${responseAction}` 
    });

    setIsResponseModalOpen(false);
    setSelectedOrder(null);
    setResponseAction(null);
    setResponseMessage("");
  };

  const openWhatsApp = (number: string, name: string, orderNumber: string) => {
    const message = encodeURIComponent(`Hello! This is ${user?.businessName || user?.username} regarding order ${orderNumber}.`);
    const whatsappUrl = `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${message}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "outline",
      approved: "default",
      rejected: "destructive",
      fulfilled: "secondary",
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOrderTypeBadge = (orderType: string) => {
    return (
      <Badge variant="secondary" className="text-xs">
        {orderType === "purchase_order" ? "Shop Order" : "Sales Person Order"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage orders from shop owners and sales persons</p>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-2">Filter by Status</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              data-testid="filter-status-all"
            >
              All ({statusCounts.all})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              data-testid="filter-status-pending"
            >
              Pending ({statusCounts.pending})
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              onClick={() => setStatusFilter("approved")}
              data-testid="filter-status-approved"
            >
              Approved ({statusCounts.approved})
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              onClick={() => setStatusFilter("rejected")}
              data-testid="filter-status-rejected"
            >
              Rejected ({statusCounts.rejected})
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Filter by Type</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              onClick={() => setTypeFilter("all")}
              data-testid="filter-type-all"
            >
              All Orders ({typeCounts.all})
            </Button>
            <Button
              variant={typeFilter === "purchase_order" ? "default" : "outline"}
              onClick={() => setTypeFilter("purchase_order")}
              data-testid="filter-type-purchase"
            >
              Shop Orders ({typeCounts.purchase_order})
            </Button>
            <Button
              variant={typeFilter === "sales_order" ? "default" : "outline"}
              onClick={() => setTypeFilter("sales_order")}
              data-testid="filter-type-sales"
            >
              Sales Person Orders ({typeCounts.sales_order})
            </Button>
          </div>
        </div>
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
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    {order.orderNumber}
                    {getStatusBadge(order.status)}
                    {getOrderTypeBadge(order.orderType)}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {order.orderType === "purchase_order" ? (
                      <>
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-base">{order.shopName}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-base">{order.salesPersonName}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.createdAt.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">Rs. {order.total.toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-semibold">{order.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
                {order.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-sm break-all">{order.email}</p>
                  </div>
                )}
                {order.address && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold">{order.address}</p>
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
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
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
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Order Notes</p>
                      <p className="text-sm text-amber-800 dark:text-amber-200">{order.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.wholesalerResponse && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100 text-sm">Your Response</p>
                      <p className="text-sm text-green-800 dark:text-green-200">{order.wholesalerResponse}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => openWhatsApp(order.whatsapp, order.shopName || order.salesPersonName || '', order.orderNumber)}
                className="w-full sm:w-auto"
                data-testid={`button-whatsapp-${order.id}`}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contact
              </Button>
              {order.status === "pending" && (
                <div className="flex gap-2 flex-1">
                  <Button 
                    variant="destructive" 
                    onClick={() => openResponseModal(order, "rejected")}
                    className="flex-1"
                    data-testid={`button-reject-${order.id}`}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => openResponseModal(order, "approved")}
                    className="flex-1"
                    data-testid={`button-approve-${order.id}`}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No orders</h3>
          <p className="text-muted-foreground">
            {statusFilter === "all" && typeFilter === "all"
              ? "You haven't received any orders yet." 
              : `No ${statusFilter !== "all" ? statusFilter : ""} ${typeFilter !== "all" ? (typeFilter === "purchase_order" ? "shop" : "sales person") : ""} orders found.`}
          </p>
        </div>
      )}

      <FormPopupModal isOpen={isResponseModalOpen} onClose={() => setIsResponseModalOpen(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {responseAction === "approved" ? "Approve Order" : "Reject Order"}
          </h2>

          {selectedOrder && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedOrder.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                {selectedOrder.shopName || selectedOrder.salesPersonName}
              </p>
              <p className="text-lg font-bold mt-2">Total: Rs. {selectedOrder.total.toLocaleString()}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Response Message {responseAction === "rejected" && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder={
                responseAction === "approved" 
                  ? "Add any delivery or payment instructions..." 
                  : "Explain reason for rejection..."
              }
              rows={4}
              data-testid="textarea-response"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsResponseModalOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleOrderAction}
              disabled={responseAction === "rejected" && !responseMessage.trim()}
              variant={responseAction === "approved" ? "default" : "destructive"}
              data-testid="button-confirm"
            >
              {responseAction === "approved" ? "Approve Order" : "Reject Order"}
            </Button>
          </div>
        </div>
      </FormPopupModal>
    </div>
  );
}
