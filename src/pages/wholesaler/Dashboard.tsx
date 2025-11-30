import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  Tag,
  ShoppingCart,
  Store,
  Eye,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  discount?: number;
  minOrderQuantity: number;
  unit: string;
  isActive: boolean;
};

type PurchaseOrder = {
  id: number;
  orderNumber: string;
  shopName: string;
  shopPhone: string;
  shopWhatsapp: string;
  contactPerson: string;
  items: { productName: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: Date;
};

export default function WholesalerDashboard() {
  useAuth("wholesalerDashboard");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setTitle("Wholesale Dashboard");
    return () => setTitle("Dashboard");
  }, [setTitle]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "iPhone 15 Pro Cases (Bulk)",
      description: "Premium silicone cases, pack of 50 units",
      category: "Accessories",
      price: 12000,
      stock: 500,
      discount: 10,
      minOrderQuantity: 1,
      unit: "pack",
      isActive: true,
    },
    {
      id: 2,
      name: "Samsung Fast Chargers (Bulk)",
      description: "Fast charging adapters, pack of 100 units",
      category: "Chargers",
      price: 18000,
      stock: 1000,
      minOrderQuantity: 1,
      unit: "pack",
      isActive: true,
    },
    {
      id: 3,
      name: "USB-C Cables (Bulk)",
      description: "High quality cables, pack of 200 units",
      category: "Cables",
      price: 24000,
      stock: 2000,
      discount: 15,
      minOrderQuantity: 1,
      unit: "pack",
      isActive: true,
    },
    {
      id: 4,
      name: "Screen Protectors (Bulk)",
      description: "Tempered glass, pack of 500 units",
      category: "Accessories",
      price: 30000,
      stock: 5000,
      minOrderQuantity: 1,
      unit: "pack",
      isActive: true,
    },
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      orderNumber: "PO-2025-001",
      shopName: "Tech Mobile Shop",
      shopPhone: "+92-300-1234567",
      shopWhatsapp: "+92-300-1234567",
      contactPerson: "Ahmed Khan",
      items: [{ productName: "iPhone Cases", quantity: 2, price: 12000 }],
      total: 24000,
      status: "pending",
      notes: "Need urgent delivery",
      createdAt: new Date("2025-01-10"),
    },
    {
      id: 2,
      orderNumber: "PO-2025-002",
      shopName: "Mobile World",
      shopPhone: "+92-321-7654321",
      shopWhatsapp: "+92-321-7654321",
      contactPerson: "Sara Ahmed",
      items: [{ productName: "USB-C Cables", quantity: 3, price: 24000 }],
      total: 72000,
      status: "pending",
      createdAt: new Date("2025-01-11"),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    discount: "",
    minOrderQuantity: "1",
    unit: "pack",
    isActive: true,
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...cats];
  }, [products]);

  const stats = useMemo(() => {
    const activeProducts = products.filter((p) => p.isActive);
    const totalStock = activeProducts.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = activeProducts.reduce(
      (sum, p) => sum + p.price * p.stock,
      0,
    );
    const pendingOrders = purchaseOrders.filter(
      (po) => po.status === "pending",
    ).length;
    return {
      totalProducts: activeProducts.length,
      totalStock,
      totalValue,
      pendingOrders,
    };
  }, [products, purchaseOrders]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    return filtered;
  }, [products, searchQuery, categoryFilter]);

  const openAdd = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      discount: "",
      minOrderQuantity: "1",
      unit: "pack",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      discount: product.discount?.toString() || "",
      minOrderQuantity: product.minOrderQuantity.toString(),
      unit: product.unit,
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    setProducts(products.filter((p) => p.id !== product.id));
    toast({ title: "Product deleted successfully" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editing) {
      setProducts(
        products.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                discount: formData.discount
                  ? parseFloat(formData.discount)
                  : undefined,
                minOrderQuantity: parseInt(formData.minOrderQuantity),
              }
            : p,
        ),
      );
      toast({ title: "Product updated successfully" });
    } else {
      const newProduct: Product = {
        id: Math.max(...products.map((p) => p.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        minOrderQuantity: parseInt(formData.minOrderQuantity),
        unit: formData.unit,
        isActive: formData.isActive,
      };
      setProducts([...products, newProduct]);
      toast({ title: "Product added successfully" });
    }

    setIsModalOpen(false);
  };

  const handleOrderAction = (
    orderId: number,
    action: "approved" | "rejected",
  ) => {
    setPurchaseOrders(
      purchaseOrders.map((po) =>
        po.id === orderId ? { ...po, status: action } : po,
      ),
    );
    toast({
      title: action === "approved" ? "Order Approved" : "Order Rejected",
      description: `Purchase order has been ${action}`,
    });
  };

  const openWhatsApp = (number: string, shopName: string) => {
    const message = encodeURIComponent(
      `Hello! I'm from ${user?.businessName || user?.username}. Regarding your order from our wholesale business.`,
    );
    window.open(
      `https://wa.me/${number.replace(/[^0-9]/g, "")}?text=${message}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          gradient="from-blue-500/10 to-indigo-500/10"
        />
        <StatCard
          title="Total Stock"
          value={stats.totalStock.toLocaleString()}
          icon={TrendingUp}
          gradient="from-green-500/10 to-teal-500/10"
        />
        <StatCard
          title="Inventory Value"
          value={`Rs. ${(stats.totalValue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          gradient="from-purple-500/10 to-pink-500/10"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders.toString()}
          icon={ShoppingCart}
          gradient="from-amber-500/10 to-orange-500/10"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex justify-between flex-col md:flex-row">
              <h2>My Products & Offers</h2>
              <Button
                onClick={openAdd}
                data-testid="button-add-product"
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardTitle>

          <CardDescription>
            Manage your wholesale product catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-search"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                className="w-full sm:w-48"
                data-testid="select-category"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="flex flex-col"
                data-testid={`product-card-${product.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {product.category}
                    </Badge>
                    {product.discount && (
                      <Badge variant="destructive" className="text-xs">
                        {product.discount}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {product.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="w-3 h-3" />
                      <span>Stock: {product.stock.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShoppingCart className="w-3 h-3" />
                      <span>
                        Min Order: {product.minOrderQuantity} {product.unit}(s)
                      </span>
                    </div>
                    <Badge
                      variant={product.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(product)}
                    className="flex-1"
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(product)}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <FormPopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">
            {editing ? "Edit Product" : "Add New Product"}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., iPhone Cases (Bulk)"
              data-testid="input-product-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the product"
              rows={3}
              data-testid="input-product-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Accessories"
                data-testid="input-product-category"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <Input
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="e.g., pack, box"
                data-testid="input-product-unit"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (Rs.) *
              </label>
              <Input
                type="number"
                step="1"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0"
                data-testid="input-product-price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                placeholder="0"
                data-testid="input-product-stock"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Discount (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                placeholder="0"
                data-testid="input-product-discount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Min Order Qty *
              </label>
              <Input
                type="number"
                value={formData.minOrderQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minOrderQuantity: e.target.value })
                }
                placeholder="1"
                data-testid="input-product-min-order"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4"
              data-testid="checkbox-product-active"
            />
            <label className="text-sm">
              Product is active and visible to shop owners
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-product">
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </FormPopupModal>
    </div>
  );
}
