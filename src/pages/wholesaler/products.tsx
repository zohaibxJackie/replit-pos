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
  Smartphone,
  Cable,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";

// Mock data for brands (these would come from backend)
const mockBrands = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "oppo", name: "OPPO" },
  { id: "vivo", name: "Vivo" },
  { id: "realme", name: "Realme" },
  { id: "oneplus", name: "OnePlus" },
  { id: "huawei", name: "Huawei" },
  { id: "google", name: "Google" },
  { id: "sony", name: "Sony" },
  { id: "anker", name: "Anker" },
  { id: "baseus", name: "Baseus" },
  { id: "ugreen", name: "UGREEN" },
];

// Mock data for mobile models by brand (these would come from backend)
const mockMobileModels: Record<string, string[]> = {
  apple: [
    "iPhone 15 Pro Max 256GB",
    "iPhone 15 Pro Max 512GB",
    "iPhone 15 Pro 128GB",
    "iPhone 15 Pro 256GB",
    "iPhone 15 Plus 128GB",
    "iPhone 15 128GB",
    "iPhone 14 Pro Max 256GB",
    "iPhone 14 Pro 256GB",
    "iPhone 13 128GB",
  ],
  samsung: [
    "Galaxy S24 Ultra 256GB",
    "Galaxy S24 Ultra 512GB",
    "Galaxy S24 Plus 256GB",
    "Galaxy S24 128GB",
    "Galaxy S23 Ultra 256GB",
    "Galaxy Z Fold 5 256GB",
    "Galaxy Z Flip 5 256GB",
    "Galaxy A54 128GB",
  ],
  xiaomi: [
    "Xiaomi 14 Pro 512GB",
    "Xiaomi 14 256GB",
    "Xiaomi 13 Pro 256GB",
    "Redmi Note 13 Pro 256GB",
    "Redmi Note 13 128GB",
    "POCO X6 Pro 256GB",
  ],
  oppo: [
    "Find X6 Pro 256GB",
    "Find X5 Pro 256GB",
    "Reno 11 Pro 256GB",
    "Reno 10 Pro 256GB",
  ],
  vivo: ["X100 Pro 256GB", "X90 Pro 256GB", "V29 Pro 256GB"],
  realme: ["GT 5 Pro 256GB", "GT Neo 6 256GB", "11 Pro Plus 256GB"],
  oneplus: ["OnePlus 12 256GB", "OnePlus 11 256GB", "OnePlus Nord 3 256GB"],
  huawei: ["Mate 60 Pro 512GB", "P60 Pro 256GB"],
  google: ["Pixel 8 Pro 256GB", "Pixel 8 128GB", "Pixel 7 Pro 256GB"],
  sony: ["Xperia 1 V 256GB", "Xperia 5 V 128GB"],
};

// Searchable Select Component
function SearchableSelect({
  items,
  placeholder,
  value,
  onChange,
  labelKey = "name",
  testId,
}: {
  items: { id: string; [k: string]: any }[];
  placeholder?: string;
  value?: string;
  onChange: (v: string) => void;
  labelKey?: string;
  testId?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      items.filter((it) =>
        String(it[labelKey] ?? "")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query, labelKey],
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-testid={testId}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder={`Search ${placeholder ?? ""}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-48 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            filtered.map((it) => (
              <SelectItem key={it.id} value={it.id}>
                {it[labelKey]}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

// Autocomplete for Mobile Models
function ModelAutocomplete({
  brandId,
  value,
  onChange,
}: {
  brandId?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value, brandId]);

  const models = useMemo(() => {
    if (!brandId) return [];
    return mockMobileModels[brandId] || [];
  }, [brandId]);

  const filteredModels = useMemo(() => {
    if (!inputValue.trim()) return models;
    return models.filter((model) =>
      model.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [models, inputValue]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    setShowSuggestions(val.length > 0 && filteredModels.length > 0);
  };

  const handleSelectModel = (model: string) => {
    setInputValue(model);
    onChange(model);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() =>
          setShowSuggestions(inputValue.length > 0 && filteredModels.length > 0)
        }
        placeholder={brandId ? "Type to search model..." : "Select brand first"}
        disabled={!brandId}
        data-testid="input-model-autocomplete"
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredModels.map((model, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover-elevate active-elevate-2"
              onClick={() => handleSelectModel(model)}
              data-testid={`suggestion-model-${idx}`}
            >
              {model}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Product = {
  id: string;
  category: "mobile" | "accessory";
  brand: string;
  brandName: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  description?: string;
};

export default function WholesalerProducts() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "mobile" | "accessory"
  >("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "mobile" | "accessory"
  >("mobile");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Form state
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [accessoryName, setAccessoryName] = useState("");
  const [sku, setSku] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTitle("Products");
  }, [setTitle]);

  const [products] = useState<Product[]>([
    {
      id: "1",
      category: "mobile",
      brand: "apple",
      brandName: "Apple",
      name: "iPhone 15 Pro Max 256GB",
      sku: "APL-I15PM-256",
      purchasePrice: 450000,
      sellingPrice: 520000,
      stock: 5,
      minStock: 3,
      description: "Brand new sealed iPhone 15 Pro Max",
    },
    {
      id: "2",
      category: "mobile",
      brand: "samsung",
      brandName: "Samsung",
      name: "Galaxy S24 Ultra 256GB",
      sku: "SAM-S24U-256",
      purchasePrice: 380000,
      sellingPrice: 450000,
      stock: 8,
      minStock: 5,
    },
    {
      id: "3",
      category: "accessory",
      brand: "anker",
      brandName: "Anker",
      name: "PowerBank 20000mAh Fast Charging",
      sku: "ANK-PB-20K",
      purchasePrice: 5000,
      sellingPrice: 7500,
      stock: 50,
      minStock: 20,
    },
    {
      id: "4",
      category: "accessory",
      brand: "baseus",
      brandName: "Baseus",
      name: "USB-C to Lightning Cable 2m",
      sku: "BAS-USBC-LT",
      purchasePrice: 1200,
      sellingPrice: 2000,
      stock: 100,
      minStock: 50,
    },
  ]);

  // First level: filter by search term and category (manual filters)
  const searchAndCategoryFiltered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brandName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  // Second level: apply DataTable column filters
  const fullyFiltered = useMemo(() => {
    return searchAndCategoryFiltered.filter((product) => {
      let matchesFilters = true;
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
          const productValue = String(product[key as keyof Product] || '').toLowerCase();
          matchesFilters = matchesFilters && productValue.includes(value.toLowerCase());
        }
      });
      return matchesFilters;
    });
  }, [searchAndCategoryFiltered, filters]);

  // Third level: paginate
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return fullyFiltered.slice(startIndex, endIndex);
  }, [fullyFiltered, page, limit]);

  const stats = useMemo(() => {
    const mobileProducts = products.filter((p) => p.category === "mobile");
    const accessoryProducts = products.filter(
      (p) => p.category === "accessory",
    );
    const lowStockProducts = products.filter((p) => p.stock < p.minStock);
    const totalValue = products.reduce(
      (sum, p) => sum + p.stock * p.purchasePrice,
      0,
    );

    return [
      {
        title: "Mobile Products",
        value: mobileProducts.length.toString(),
        icon: Smartphone,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
      {
        title: "Accessories",
        value: accessoryProducts.length.toString(),
        icon: Cable,
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
        title: "Inventory Value",
        value: `Rs. ${(totalValue / 1000).toFixed(0)}K`,
        icon: DollarSign,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
    ];
  }, [products]);

  const resetForm = () => {
    setBrand("");
    setModelName("");
    setAccessoryName("");
    setSku("");
    setPurchasePrice("");
    setSellingPrice("");
    setStock("");
    setMinStock("");
    setDescription("");
  };

  const handleAddProduct = () => {
    // Validation
    if (!brand) {
      toast({
        title: "Error",
        description: "Please select a brand",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategory === "mobile" && !modelName.trim()) {
      toast({
        title: "Error",
        description: "Please select or enter a mobile model",
        variant: "destructive",
      });
      return;
    }

    if (selectedCategory === "accessory" && !accessoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter accessory name",
        variant: "destructive",
      });
      return;
    }

    if (!sku || !purchasePrice || !sellingPrice || !stock || !minStock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const productName =
      selectedCategory === "mobile" ? modelName : accessoryName;

    toast({
      title: "Product Added",
      description: `${productName} has been added successfully`,
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleCategoryChange = (category: "mobile" | "accessory") => {
    setSelectedCategory(category);
    // Reset category-specific fields
    setModelName("");
    setAccessoryName("");
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    // Reset model when brand changes (for mobile category)
    if (selectedCategory === "mobile") {
      setModelName("");
    }
  };

  // DataTable columns
  const columns = [
    {
      key: "category",
      label: "Category",
      filterType: "select" as const,
      filterOptions: ["mobile", "accessory"],
      render: (value: string) => (
        <Badge variant="secondary">
          {value === "mobile" ? (
            <><Smartphone className="w-3 h-3 mr-1" />Mobile</>
          ) : (
            <><Cable className="w-3 h-3 mr-1" />Accessory</>
          )}
        </Badge>
      ),
    },
    {
      key: "brandName",
      label: "Brand",
      filterType: "text" as const,
    },
    {
      key: "name",
      label: "Product Name",
      filterType: "text" as const,
    },
    {
      key: "sku",
      label: "SKU",
      filterType: "text" as const,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "purchasePrice",
      label: "Purchase Price",
      filterType: "none" as const,
      render: (value: number) => `Rs. ${value.toLocaleString()}`,
    },
    {
      key: "sellingPrice",
      label: "Selling Price",
      filterType: "none" as const,
      render: (value: number) => (
        <span className="text-green-600 font-medium">Rs. {value.toLocaleString()}</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      filterType: "none" as const,
      render: (value: number, row: Product) => (
        <div className="flex items-center gap-2">
          <span>{value} / {row.minStock} min</span>
          {value < row.minStock && (
            <Badge variant="destructive" className="text-xs">Low</Badge>
          )}
        </div>
      ),
    },
    {
      key: "profitMargin",
      label: "Profit Margin",
      filterType: "none" as const,
      render: (_: any, row: Product) => (
        <span className="text-green-600 font-medium">
          Rs. {(row.sellingPrice - row.purchasePrice).toLocaleString()}
        </span>
      ),
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            onClick={() => setCategoryFilter("all")}
            data-testid="filter-all"
          >
            All
          </Button>
          <Button
            variant={categoryFilter === "mobile" ? "default" : "outline"}
            onClick={() => setCategoryFilter("mobile")}
            data-testid="filter-mobile"
          >
            Mobile
          </Button>
          <Button
            variant={categoryFilter === "accessory" ? "default" : "outline"}
            onClick={() => setCategoryFilter("accessory")}
            data-testid="filter-accessory"
          >
            Accessories
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <TablePageSizeSelector limit={limit} onChange={(val) => {
          setLimit(val);
          setPage(1);
        }} />
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="button-add-product"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={paginatedProducts}
        showActions
        renderActions={(row) => (
          <Button
            variant="outline"
            size="sm"
            data-testid={`button-edit-${row.id}`}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      <TablePagination
        page={page}
        limit={limit}
        total={fullyFiltered.length}
        onPageChange={setPage}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto max-w-2xl"
          data-testid="dialog-add-product"
        >
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a mobile or accessory product to your inventory
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={selectedCategory}
            onValueChange={(v) =>
              handleCategoryChange(v as "mobile" | "accessory")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mobile" data-testid="tab-mobile">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="accessory" data-testid="tab-accessory">
                <Cable className="w-4 h-4 mr-2" />
                Accessory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mobile" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-brand">Brand *</Label>
                <SearchableSelect
                  items={mockBrands}
                  placeholder="Select brand"
                  value={brand}
                  onChange={handleBrandChange}
                  testId="select-mobile-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-model">Model Name *</Label>
                <ModelAutocomplete
                  brandId={brand}
                  value={modelName}
                  onChange={setModelName}
                />
                <p className="text-xs text-muted-foreground">
                  Type to search from available models for the selected brand
                </p>
              </div>
            </TabsContent>

            <TabsContent value="accessory" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="accessory-brand">Brand *</Label>
                <SearchableSelect
                  items={mockBrands}
                  placeholder="Select brand"
                  value={brand}
                  onChange={setBrand}
                  testId="select-accessory-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessory-name">Product Name *</Label>
                <Input
                  id="accessory-name"
                  value={accessoryName}
                  onChange={(e) => setAccessoryName(e.target.value)}
                  placeholder="e.g., PowerBank 20000mAh Fast Charging"
                  data-testid="input-accessory-name"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., APL-I15PM-256"
                data-testid="input-sku"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (Rs.) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="450000"
                  data-testid="input-purchase-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (Rs.) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="520000"
                  data-testid="input-selling-price"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="5"
                  data-testid="input-stock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="3"
                  data-testid="input-min-stock"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description..."
                rows={3}
                data-testid="textarea-description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct} data-testid="button-submit">
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
