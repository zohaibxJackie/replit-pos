import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProductSearch from "@/components/ProductSearch";
import CartItem from "@/components/CartItem";
import { CustomerFormDialog, CustomerFormData } from "@/components/CustomerFormDialog";
import { QuickProductsDialog } from "@/components/QuickProductsDialog";
import { BarcodeScannerDialog } from "@/components/BarcodeScannerDialog";
import { useQuickProducts } from "@/hooks/useQuickProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Printer,
  Check,
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  PauseCircle,
  RotateCcw,
  Trash2,
  DollarSign,
  Star,
  Settings,
  Menu,
  ShoppingCart,
  Camera,
} from "lucide-react";
import { mockProducts } from "@/utils/mockData";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { printReceipt, Receipt, openCashDrawer } from "@/utils/thermalPrinter";
import { useTitle } from "@/context/TitleContext";
import { PaymentDialog } from "@/components/PaymentDialog";
import { MobileInvoice } from "@/components/MobileInvoice";
import { printElement } from "@/utils/print";

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  lowStock: boolean;
  type?: 'mobile' | 'accessory';
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "mobile", label: "Mobile Payment", icon: Smartphone },
] as const;

export default function POS() {
  useAuth(["sales_person", "admin"]);
  const { setOpen: setSidebarOpen } = useSidebar();
  const { setTitle } = useTitle();
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [taxRate] = useState(0.1);
  const [discount, setDiscount] = useState(0);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customers, setCustomers] = useState<Customer[]>([
    { id: "1", name: "Walk-in Customer", phone: "" },
  ]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ amountPaid: number; change: number } | null>(null);
  const [heldOrders, setHeldOrders] = useState<
    { cart: CartItemType[]; customer: Customer | null }[]
  >([]);
  const { quickProducts, setQuickProducts, maxQuickProducts } =
    useQuickProducts();

  useEffect(() => {
    setTitle("POS");
  }, [setTitle]);

  const performSearch = () => {
    const product = mockProducts.find(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode === search,
    );
    if (product) {
      handleAddToCart(product);
      setSearch("");
    }
  };

  const handleAddToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        toast({
          title: "Out of Stock",
          description: "No more stock available",
          variant: "destructive",
        });
      }
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          quantity: 1,
          stock: product.stock,
          lowStock: product.stock < product.lowStockThreshold,
          type: product.type,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(
      cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const handleRemove = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  const handleHoldOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Nothing to hold",
        variant: "destructive",
      });
      return;
    }
    setHeldOrders([
      ...heldOrders,
      { cart: [...cart], customer: selectedCustomer },
    ]);
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    toast({ title: "Order Held", description: "Order saved for later" });
  };

  const handleRecallOrder = () => {
    if (heldOrders.length === 0) {
      toast({
        title: "No Held Orders",
        description: "No orders on hold",
        variant: "destructive",
      });
      return;
    }
    const lastOrder = heldOrders[heldOrders.length - 1];
    setCart(lastOrder.cart);
    setSelectedCustomer(lastOrder.customer);
    setHeldOrders(heldOrders.slice(0, -1));
    toast({ title: "Order Recalled", description: "Last held order restored" });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    toast({ title: "Cart Cleared", description: "All items removed" });
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart first",
        variant: "destructive",
      });
      return;
    }

    const receipt: Receipt = {
      id: `POS-${Date.now()}`,
      date: new Date(),
      storeName: "Sell POS",
      storeAddress: "1234 Business Avenue, Suite 500",
      storePhone: "+1 (555) 123-4567",
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod:
        PAYMENT_METHODS.find((pm) => pm.value === paymentMethod)?.label ||
        "Cash",
      customerName: selectedCustomer?.name,
      cashierName: "Current User",
    };

    setCurrentReceipt(receipt);

    if (paymentMethod === "cash") {
      setShowPaymentDialog(true);
    } else {
      await processPayment(receipt);
    }
  };

  const handlePaymentConfirm = async (amountPaid: number, change: number) => {
    if (!currentReceipt) return;

    await processPayment(currentReceipt, amountPaid, change);
  };

  const processPayment = async (receipt: Receipt, amountPaid?: number, change?: number) => {
    try {
      const cartSnapshot = [...cart];
      const hasMobileProduct = cartSnapshot.some((item) => item.type === 'mobile');
      const hasAccessoryProduct = cartSnapshot.some((item) => item.type === 'accessory' || !item.type);

      setPaymentDetails(amountPaid && change !== undefined ? { amountPaid, change } : null);

      await new Promise(resolve => setTimeout(resolve, 100));

      if (hasMobileProduct) {
        await printElement('mobile-invoice', { 
          title: `Invoice ${receipt.id}`,
          onBeforePrint: () => {
            const invoiceEl = document.getElementById('mobile-invoice');
            if (invoiceEl) {
              invoiceEl.classList.remove('hidden');
            }
          },
          onAfterPrint: () => {
            const invoiceEl = document.getElementById('mobile-invoice');
            if (invoiceEl) {
              invoiceEl.classList.add('hidden');
            }
          }
        });
      }

      if (hasAccessoryProduct && !hasMobileProduct) {
        await printReceipt(receipt, false);
      }

      if (paymentMethod === "cash") {
        try {
          const drawerCommand = openCashDrawer();
          await fetch("http://localhost:9100/print", {
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: drawerCommand,
          });
        } catch (error) {
          console.log("Cash drawer not available");
        }
      }

      toast({
        title: "Sale Completed",
        description: change !== undefined 
          ? `Total: $${total.toFixed(2)} | Change: $${change.toFixed(2)}`
          : `Total: $${total.toFixed(2)}`,
      });
      
      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);
      
      setTimeout(() => {
        setCurrentReceipt(null);
        setPaymentDetails(null);
      }, 500);
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Receipt sent to fallback printer",
        variant: "destructive",
      });
    }
  };

  const handlePrintReceipt = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart first",
        variant: "destructive",
      });
      return;
    }

    const receipt: Receipt = {
      id: `POS-${Date.now()}`,
      date: new Date(),
      storeName: "Sell POS",
      storeAddress: "1234 Business Avenue, Suite 500",
      storePhone: "+1 (555) 123-4567",
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod:
        PAYMENT_METHODS.find((pm) => pm.value === paymentMethod)?.label ||
        "Cash",
      customerName: selectedCustomer?.name,
      cashierName: "Current User",
    };

    try {
      await printReceipt(receipt, false);
      toast({
        title: "Receipt Printing",
        description: "Receipt sent to printer",
      });
    } catch (error) {
      toast({
        title: "Print Error",
        description: "Could not print receipt",
        variant: "destructive",
      });
    }
  };

  const handleOpenDrawer = async () => {
    try {
      const drawerCommand = openCashDrawer();
      await fetch("http://localhost:9100/print", {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: drawerCommand,
      });
      toast({ title: "Cash Drawer", description: "Opening cash drawer..." });
    } catch (error) {
      toast({
        title: "Drawer Error",
        description: "Could not open cash drawer",
        variant: "destructive",
      });
    }
  };

  const handleScanning = () => {
    setShowScannerDialog(true);
  };

  const handleBarcodeScanned = (barcode: string) => {
    setResult(barcode);
    setSearch(barcode);
    const product = mockProducts.find((p) => p.barcode === barcode);
    if (product) {
      handleAddToCart(product);
      toast({
        title: "Product Added",
        description: `${product.name} added to cart`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode: ${barcode}`,
        variant: "destructive",
      });
    }
  };

  const handleCustomerAdded = (customerData: CustomerFormData) => {
    const customer: Customer = {
      id: customerData.id?.toString() || `temp_${Date.now()}`,
      name: customerData.name,
      phone: customerData.phone,
    };
    setCustomers([...customers, customer]);
    setSelectedCustomer(customer);
  };

  const orderSummaryContent = (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Customer</Label>
        <Select
          value={selectedCustomer?.id || ""}
          onValueChange={(value) => {
            const customer = customers.find((c) => c.id === value);
            setSelectedCustomer(customer || null);
          }}
        >
          <SelectTrigger data-testid="select-customer">
            <SelectValue placeholder="Walk-in Customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowCustomerDialog(true)}
          data-testid="button-add-new-customer"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      <Separator />

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium" data-testid="text-subtotal">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (10%)</span>
          <span className="font-medium" data-testid="text-tax">
            ${tax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <Label
            htmlFor="discount"
            className="text-muted-foreground whitespace-nowrap"
          >
            Discount
          </Label>
          <Input
            id="discount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            className="w-28 text-right"
            min="0"
            step="0.01"
            data-testid="input-discount"
          />
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-center py-2">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-2xl font-bold" data-testid="text-total">
          ${total.toFixed(2)}
        </span>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.value;
            return (
              <Button
                key={method.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMethod(method.value)}
                className="flex flex-col h-auto py-3 gap-1"
                data-testid={`button-payment-${method.value}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{method.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Button
          className="w-full"
          size="lg"
          onClick={handleCompleteSale}
          disabled={cart.length === 0}
          data-testid="button-complete-sale"
        >
          <Check className="w-5 h-5 mr-2" />
          Complete Sale
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handlePrintReceipt}
          disabled={cart.length === 0}
          data-testid="button-print-receipt"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Receipt
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Product Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSearch
                    products={mockProducts}
                    onSelectProduct={handleAddToCart}
                    handleScanning={handleScanning}
                    search={search}
                    onKeyDown={performSearch}
                    setSearch={setSearch}
                    result={result}
                    setResult={setResult}
                    autoFocus
                  />
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleScanning}
                  data-testid="button-scan-barcode"
                  className="flex-shrink-0"
                >
                  <Camera className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Scan Barcode</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHoldOrder}
                  disabled={cart.length === 0}
                  data-testid="button-hold-order"
                  className="flex-shrink-0"
                >
                  <PauseCircle className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Hold</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecallOrder}
                  disabled={heldOrders.length === 0}
                  data-testid="button-recall-order"
                  className="flex-shrink-0"
                >
                  <RotateCcw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Recall</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  disabled={cart.length === 0}
                  data-testid="button-clear-cart"
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenDrawer}
                  data-testid="button-open-drawer"
                  className="flex-shrink-0"
                >
                  <DollarSign className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Drawer</span>
                </Button>

                <div className="flex-1 min-w-fit">
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <span className="text-xs text-muted-foreground mr-1">Items:</span>
                    <span className="font-semibold">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="cart" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cart" data-testid="tab-cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                  </TabsTrigger>
                  <TabsTrigger value="quick" data-testid="tab-quick-products">
                    <Star className="w-4 h-4 mr-2" />
                    Quick Products
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cart" className="flex-1 mt-4 min-h-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg">Current Sale</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            No items in cart
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Scan or search to add products
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <CartItem
                              key={item.id}
                              {...item}
                              onUpdateQuantity={handleUpdateQuantity}
                              onRemove={handleRemove}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quick" className="flex-1 mt-4 min-h-0">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        <CardTitle className="text-base sm:text-lg">Quick Products</CardTitle>
                      </div>
                      <QuickProductsDialog
                        products={mockProducts}
                        selectedIds={quickProducts}
                        maxSelections={maxQuickProducts}
                        onSave={setQuickProducts}
                      />
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                      {quickProducts.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {quickProducts.map((productId) => {
                            const product = mockProducts.find(
                              (p) => p.id === productId
                            );
                            if (!product) return null;

                            return (
                              <Button
                                key={product.id}
                                variant="secondary"
                                className="h-auto flex flex-col items-start p-3 gap-1 min-w-0"
                                onClick={() => handleAddToCart(product)}
                                data-testid={`quick-product-${product.id}`}
                              >
                                <div className="font-medium text-sm text-left line-clamp-2 w-full break-words">
                                  {product.name}
                                </div>
                                <div className="text-primary font-semibold">
                                  ${product.price}
                                </div>
                                {product.stock < product.lowStockThreshold && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    Low Stock
                                  </Badge>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Star className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No quick products selected</p>
                          <p className="text-xs mt-1">
                            Click "Manage" to add frequently used products
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>{orderSummaryContent}</CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky bottom-0 left-0 right-0 border-t bg-background p-3 shadow-lg z-50">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-xl font-bold" data-testid="text-total-mobile">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full" size="lg" data-testid="button-checkout-mobile">
              <Check className="w-5 h-5 mr-2" />
              Checkout ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Order Summary</SheetTitle>
            </SheetHeader>
            <div className="mt-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              {orderSummaryContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <CustomerFormDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onCustomerAdded={handleCustomerAdded}
      />

      <BarcodeScannerDialog
        open={showScannerDialog}
        onOpenChange={setShowScannerDialog}
        onScanSuccess={handleBarcodeScanned}
      />

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        total={total}
        onConfirmPayment={handlePaymentConfirm}
      />

      {currentReceipt && (
        <MobileInvoice
          receipt={currentReceipt}
          amountPaid={paymentDetails?.amountPaid}
          change={paymentDetails?.change}
        />
      )}
    </div>
  );
}
