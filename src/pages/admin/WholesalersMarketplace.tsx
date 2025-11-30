import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Package, Tag, Store, Plus, Minus, Send, TrendingDown, X } from "lucide-react";

type WholesalerProduct = {
  id: number;
  wholesalerId: number;
  wholesalerName: string;
  wholesalerContact: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  discount?: number;
  minOrderQuantity: number;
  finalPrice: number;
};

export default function WholesalersMarketplace() {
  useAuth("adminWholesalersMarketplace");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { toast } = useToast();

  useEffect(() => {
    setTitle("Wholesale Marketplace");
    return () => setTitle("Dashboard");
  }, [setTitle]);

  const allProducts: WholesalerProduct[] = [
    {
      id: 1,
      wholesalerId: 1,
      wholesalerName: "TechWholesale Co.",
      wholesalerContact: "+92-300-1234567",
      name: "iPhone 15 Pro Cases",
      description: "Premium silicone cases, bulk pack of 50 units. Multiple colors available.",
      category: "Accessories",
      price: 12000,
      stock: 500,
      discount: 10,
      minOrderQuantity: 1,
      finalPrice: 10800,
    },
    {
      id: 2,
      wholesalerId: 1,
      wholesalerName: "TechWholesale Co.",
      wholesalerContact: "+92-300-1234567",
      name: "Samsung Fast Chargers",
      description: "Original Samsung fast charging adapters, bulk pack of 100 units.",
      category: "Chargers",
      price: 18000,
      stock: 1000,
      minOrderQuantity: 1,
      finalPrice: 18000,
    },
    {
      id: 3,
      wholesalerId: 2,
      wholesalerName: "BulkTech Supplies",
      wholesalerContact: "+92-321-9876543",
      name: "USB-C Premium Cables",
      description: "High quality braided USB-C cables, bulk pack of 200 units. 2m length.",
      category: "Cables",
      price: 24000,
      stock: 2000,
      discount: 15,
      minOrderQuantity: 1,
      finalPrice: 20400,
    },
    {
      id: 4,
      wholesalerId: 2,
      wholesalerName: "BulkTech Supplies",
      wholesalerContact: "+92-321-9876543",
      name: "Tempered Glass Screen Protectors",
      description: "Premium 9H hardness tempered glass, bulk pack of 500 units. Anti-fingerprint coating.",
      category: "Accessories",
      price: 30000,
      stock: 5000,
      minOrderQuantity: 1,
      finalPrice: 30000,
    },
    {
      id: 5,
      wholesalerId: 3,
      wholesalerName: "MegaStock Electronics",
      wholesalerContact: "+92-333-5554444",
      name: "10000mAh Power Banks",
      description: "Fast charging power banks with dual USB ports, bulk pack of 50 units.",
      category: "Accessories",
      price: 45000,
      stock: 300,
      discount: 20,
      minOrderQuantity: 1,
      finalPrice: 36000,
    },
    {
      id: 6,
      wholesalerId: 3,
      wholesalerName: "MegaStock Electronics",
      wholesalerContact: "+92-333-5554444",
      name: "Wireless Earbuds Pro",
      description: "Premium TWS earbuds with noise cancellation, bulk pack of 25 units.",
      category: "Audio",
      price: 62500,
      stock: 150,
      discount: 12,
      minOrderQuantity: 1,
      finalPrice: 55000,
    },
    {
      id: 7,
      wholesalerId: 1,
      wholesalerName: "TechWholesale Co.",
      wholesalerContact: "+92-300-1234567",
      name: "Smart Watch Straps",
      description: "Universal smart watch replacement straps, bulk pack of 100 units. Various colors.",
      category: "Accessories",
      price: 15000,
      stock: 800,
      discount: 8,
      minOrderQuantity: 1,
      finalPrice: 13800,
    },
    {
      id: 8,
      wholesalerId: 2,
      wholesalerName: "BulkTech Supplies",
      wholesalerContact: "+92-321-9876543",
      name: "Car Phone Holders",
      description: "Magnetic car phone holders with 360° rotation, bulk pack of 75 units.",
      category: "Accessories",
      price: 18750,
      stock: 400,
      finalPrice: 18750,
      minOrderQuantity: 1,
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [cart, setCart] = useState<{ product: WholesalerProduct; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDealRequestOpen, setIsDealRequestOpen] = useState(false);
  const [selectedProductForDeal, setSelectedProductForDeal] = useState<WholesalerProduct | null>(null);
  const [dealMessage, setDealMessage] = useState("");
  const [dealQuantity, setDealQuantity] = useState(1);
  const [dealRequestedDiscount, setDealRequestedDiscount] = useState("");
  const [selectedWholesalerId, setSelectedWholesalerId] = useState<number | null>(null);
  const [isWholesalerProfileOpen, setIsWholesalerProfileOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(allProducts.map(p => p.category)));
    return ["all", ...cats];
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.wholesalerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.finalPrice - a.finalPrice);
    } else if (sortBy === "discount") {
      filtered = [...filtered].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.finalPrice * item.quantity), 0);
  }, [cart]);

  const addToCart = (product: WholesalerProduct) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: product.minOrderQuantity }]);
    }
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your purchase order.`,
    });
  };

  const updateQuantity = (productId: number, change: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(item.product.minOrderQuantity, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const submitPurchaseOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is Empty",
        description: "Please add products to your cart first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Purchase Order Sent!",
      description: `Your order for Rs. ${cartTotal.toLocaleString()} has been sent to the wholesaler.`,
    });

    setCart([]);
    setIsCartOpen(false);
  };

  const openDealRequest = (product: WholesalerProduct) => {
    setSelectedProductForDeal(product);
    setDealMessage("");
    setDealQuantity(product.minOrderQuantity);
    setDealRequestedDiscount("");
    setIsDealRequestOpen(true);
  };

  const submitDealRequest = () => {
    if (!selectedProductForDeal || !dealMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deal Request Sent!",
      description: `Your deal request for ${selectedProductForDeal.name} has been sent to ${selectedProductForDeal.wholesalerName}.`,
    });

    setIsDealRequestOpen(false);
  };

  const viewWholesalerProfile = (wholesalerId: number) => {
    setSelectedWholesalerId(wholesalerId);
    setIsWholesalerProfileOpen(true);
  };

  const wholesalerProducts = useMemo(() => {
    if (!selectedWholesalerId) return [];
    return allProducts.filter(p => p.wholesalerId === selectedWholesalerId);
  }, [selectedWholesalerId]);

  const selectedWholesaler = useMemo(() => {
    if (!selectedWholesalerId) return null;
    const product = allProducts.find(p => p.wholesalerId === selectedWholesalerId);
    if (!product) return null;
    return {
      id: product.wholesalerId,
      name: product.wholesalerName,
      contact: product.wholesalerContact,
      totalProducts: allProducts.filter(p => p.wholesalerId === selectedWholesalerId).length,
    };
  }, [selectedWholesalerId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center justify-end">
          <div>
            <Input
              placeholder="Search products or wholesalers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search"
            />
          </div>
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="discount">Best Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button
              onClick={() => setIsCartOpen(true)}
              variant="default"
              data-testid="button-view-cart"
              className="relative w-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              View Cart {cart.length > 0 && `(${cart.length})`}
              
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="flex flex-col hover-elevate" data-testid={`product-card-${product.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-col gap-1">
                  <Badge 
                    variant="outline" 
                    className="text-xs w-fit cursor-pointer hover-elevate" 
                    onClick={() => viewWholesalerProfile(product.wholesalerId)}
                    data-testid={`badge-wholesaler-${product.wholesalerId}`}
                  >
                    <Store className="w-3 h-3 mr-1" />
                    {product.wholesalerName}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs w-fit cursor-pointer hover-elevate"
                    onClick={() => {
                      const message = encodeURIComponent(`Hello! I'm interested in ${product.name} from your wholesale catalog.`);
                      window.open(`https://wa.me/${product.wholesalerContact.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
                    }}
                    data-testid={`button-whatsapp-${product.id}`}
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Contact
                  </Badge>
                </div>
                {product.discount && (
                  <Badge variant="destructive" className="text-xs">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {product.discount}% OFF
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            </CardHeader>
            <CardContent className="pb-3 flex-1">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  {product.discount ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        Rs. {product.finalPrice.toLocaleString()}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="w-3 h-3" />
                  <span>Min Order: {product.minOrderQuantity} pack(s)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  <span>{product.category}</span>
                </div>
                <div className="text-xs">
                  <span className={product.stock > 100 ? "text-green-600" : "text-orange-600"}>
                    {product.stock > 100 ? "In Stock" : `Low Stock (${product.stock})`}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => addToCart(product)}
                data-testid={`button-add-cart-${product.id}`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => openDealRequest(product)}
                data-testid={`button-request-deal-${product.id}`}
              >
                <Send className="w-4 h-4 mr-2" />
                Request Deal
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      <FormPopupModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Purchase Order Cart</h2>
            <p className="text-sm text-muted-foreground mt-1">Review and submit your order</p>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.wholesalerName}</p>
                      <p className="text-sm font-bold mt-1">Rs. {item.product.finalPrice.toLocaleString()} / pack</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={item.quantity <= item.product.minOrderQuantity}
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.product.id)}
                        data-testid={`button-remove-${item.product.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right sm:w-32">
                      <p className="font-bold text-base sm:text-lg">Rs. {(item.product.finalPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full sm:w-auto"
                  data-testid="button-close-cart"
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={submitPurchaseOrder}
                  className="w-full flex-1"
                  data-testid="button-submit-order"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Purchase Order
                </Button>
              </div>
            </>
          )}
        </div>
      </FormPopupModal>

      <FormPopupModal isOpen={isDealRequestOpen} onClose={() => setIsDealRequestOpen(false)}>
        {selectedProductForDeal && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Request Special Deal</h2>
              <p className="text-sm text-muted-foreground mt-1">Negotiate better terms with the wholesaler</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedProductForDeal.name}</p>
              <p className="text-sm text-muted-foreground">{selectedProductForDeal.wholesalerName}</p>
              <p className="text-lg font-bold mt-2">Current Price: Rs. {selectedProductForDeal.finalPrice.toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity (packs)</label>
              <Input
                type="number"
                min={selectedProductForDeal.minOrderQuantity}
                value={dealQuantity}
                onChange={(e) => setDealQuantity(parseInt(e.target.value))}
                data-testid="input-deal-quantity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Requested Discount (%) - Optional</label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={dealRequestedDiscount}
                onChange={(e) => setDealRequestedDiscount(e.target.value)}
                placeholder="e.g., 25"
                data-testid="input-deal-discount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message to Wholesaler *</label>
              <Textarea
                value={dealMessage}
                onChange={(e) => setDealMessage(e.target.value)}
                placeholder="Explain your requirements, order frequency, or negotiation terms..."
                rows={4}
                data-testid="textarea-deal-message"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDealRequestOpen(false)}
                className="w-full sm:w-auto"
                data-testid="button-cancel-deal"
              >
                Cancel
              </Button>
              <Button
                onClick={submitDealRequest}
                className="w-full flex-1"
                data-testid="button-submit-deal"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Deal Request
              </Button>
            </div>
          </div>
        )}
      </FormPopupModal>

      <FormPopupModal isOpen={isWholesalerProfileOpen} onClose={() => setIsWholesalerProfileOpen(false)}>
        {selectedWholesaler && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedWholesaler.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedWholesaler.totalProducts} products available • {selectedWholesaler.contact}
              </p>
            </div>

            <div>
              <Button
                variant="default"
                onClick={() => {
                  const message = encodeURIComponent(`Hello! I'm interested in your wholesale products.`);
                  window.open(`https://wa.me/${selectedWholesaler.contact.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
                }}
                data-testid="button-whatsapp-wholesaler"
                className="w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contact via WhatsApp
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">All Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {wholesalerProducts.map((product) => (
                  <Card key={product.id} className="hover-elevate">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
                        {product.discount && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        {product.discount ? (
                          <>
                            <span className="text-xl font-bold text-primary">
                              Rs. {product.finalPrice.toLocaleString()}
                            </span>
                            <span className="text-xs line-through text-muted-foreground">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-primary">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Package className="w-3 h-3" />
                        <span>Min: {product.minOrderQuantity} pack(s) • {product.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            addToCart(product);
                            setIsWholesalerProfileOpen(false);
                          }}
                          data-testid={`button-profile-add-cart-${product.id}`}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsWholesalerProfileOpen(false)} data-testid="button-close-profile">
                Close
              </Button>
            </div>
          </div>
        )}
      </FormPopupModal>
    </div>
  );
}
