import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
  Edit,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function WholesalerProducts() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    wholesalePrice: "",
    stock: "",
    minStock: "",
    description: "",
  });

  useEffect(() => {
    setTitle("Products");
  }, [setTitle]);

  const products = [
    {
      id: "1",
      name: "Premium Wireless Mouse",
      sku: "WM-PRO-001",
      category: "Electronics",
      unitPrice: "$45.00",
      wholesalePrice: "$32.00",
      stock: 150,
      minStock: 30,
      monthlySales: 85,
      status: "in_stock",
      description: "High-quality wireless mouse with ergonomic design",
    },
    {
      id: "2",
      name: "Mechanical Keyboard RGB",
      sku: "KB-RGB-002",
      category: "Electronics",
      unitPrice: "$120.00",
      wholesalePrice: "$85.00",
      stock: 25,
      minStock: 20,
      monthlySales: 42,
      status: "low_stock",
      description: "Professional mechanical keyboard with RGB lighting",
    },
    {
      id: "3",
      name: "USB-C Hub 7-in-1",
      sku: "HUB-7P-003",
      category: "Accessories",
      unitPrice: "$65.00",
      wholesalePrice: "$45.00",
      stock: 200,
      minStock: 50,
      monthlySales: 120,
      status: "in_stock",
      description: "Versatile 7-port USB-C hub for laptops",
    },
    {
      id: "4",
      name: "Laptop Stand Aluminum",
      sku: "LS-ALU-004",
      category: "Accessories",
      unitPrice: "$35.00",
      wholesalePrice: "$22.00",
      stock: 0,
      minStock: 15,
      monthlySales: 65,
      status: "out_of_stock",
      description: "Adjustable aluminum laptop stand",
    },
    {
      id: "5",
      name: "Wireless Earbuds Pro",
      sku: "WE-PRO-005",
      category: "Audio",
      unitPrice: "$95.00",
      wholesalePrice: "$68.00",
      stock: 75,
      minStock: 25,
      monthlySales: 95,
      status: "in_stock",
      description: "Premium wireless earbuds with noise cancellation",
    },
  ];

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "low_stock":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "out_of_stock":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return status;
    }
  };

  const lowStockProducts = products.filter((p) => p.stock < p.minStock);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce(
    (sum, p) =>
      sum + p.stock * parseFloat(p.wholesalePrice.replace("$", "")),
    0,
  );

  const stats = [
    {
      title: "Total Products",
      value: products.length.toString(),
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Inventory Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Monthly Sales",
      value: products.reduce((sum, p) => sum + p.monthlySales, 0).toString(),
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const handleAddProduct = () => {
    if (
      !formData.name ||
      !formData.sku ||
      !formData.category ||
      !formData.unitPrice ||
      !formData.wholesalePrice ||
      !formData.stock ||
      !formData.minStock
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Product Added",
      description: `${formData.name} has been added to inventory`,
    });

    setFormData({
      name: "",
      sku: "",
      category: "",
      unitPrice: "",
      wholesalePrice: "",
      stock: "",
      minStock: "",
      description: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = () => {
    if (
      !formData.name ||
      !formData.sku ||
      !formData.category ||
      !formData.unitPrice ||
      !formData.wholesalePrice ||
      !formData.stock ||
      !formData.minStock
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Product Updated",
      description: `${formData.name} has been updated`,
    });

    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Products Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage your wholesale products and track stock levels
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-product"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
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

      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-amber-500/50" data-testid="card-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockProducts.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-sm font-medium text-red-500">
                    {outOfStockProducts.length} product(s) out of stock
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {outOfStockProducts.map((p) => p.name).join(", ")}
                  </p>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <p className="text-sm font-medium text-amber-500">
                    {lowStockProducts.length} product(s) running low
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lowStockProducts.map((p) => p.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-search">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found matching your search</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} data-testid={`card-product-${product.id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-semibold text-lg"
                        data-testid={`text-product-name-${product.id}`}
                      >
                        {product.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getStatusColor(product.status)}
                        data-testid={`badge-status-${product.id}`}
                      >
                        {getStatusText(product.status)}
                      </Badge>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {product.description}
                    </p>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <p className="text-sm text-muted-foreground">SKU</p>
                        <p className="text-sm font-medium font-mono">
                          {product.sku}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Unit Price
                        </p>
                        <p className="text-sm font-medium">
                          {product.unitPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Wholesale Price
                        </p>
                        <p className="text-sm font-medium">
                          {product.wholesalePrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Stock
                        </p>
                        <p className="text-sm font-medium">
                          {product.stock} / {product.minStock} min
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Monthly Sales
                        </p>
                        <p className="text-sm font-medium">
                          {product.monthlySales}
                        </p>
                      </div>
                    </div>

                    {product.stock < product.minStock && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          {product.stock === 0
                            ? "Out of stock - reorder immediately"
                            : `Stock below minimum (${product.minStock - product.stock} needed)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setFormData({
                          name: product.name,
                          sku: product.sku,
                          category: product.category,
                          unitPrice: product.unitPrice.replace("$", ""),
                          wholesalePrice: product.wholesalePrice.replace("$", ""),
                          stock: product.stock.toString(),
                          minStock: product.minStock.toString(),
                          description: product.description,
                        });
                        setIsEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-${product.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="dialog-add-product">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your wholesale inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Premium Wireless Mouse"
                data-testid="input-product-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="e.g., WM-PRO-001"
                data-testid="input-sku"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Computing">Computing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  placeholder="0.00"
                  data-testid="input-unit-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wholesalePrice">Wholesale Price ($) *</Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  value={formData.wholesalePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, wholesalePrice: e.target.value })
                  }
                  placeholder="0.00"
                  data-testid="input-wholesale-price"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="0"
                  data-testid="input-stock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock Level *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  placeholder="0"
                  data-testid="input-min-stock"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description..."
                data-testid="input-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              data-testid="button-cancel-add"
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct} data-testid="button-save-product">
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-product">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and stock levels
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sku">SKU *</Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                data-testid="input-edit-sku"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger data-testid="select-edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Computing">Computing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unitPrice">Unit Price ($) *</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  data-testid="input-edit-unit-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-wholesalePrice">Wholesale Price ($) *</Label>
                <Input
                  id="edit-wholesalePrice"
                  type="number"
                  step="0.01"
                  value={formData.wholesalePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, wholesalePrice: e.target.value })
                  }
                  data-testid="input-edit-wholesale-price"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  data-testid="input-edit-stock"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minStock">Min Stock Level *</Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: e.target.value })
                  }
                  data-testid="input-edit-min-stock"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                data-testid="input-edit-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button onClick={handleEditProduct} data-testid="button-update-product">
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
