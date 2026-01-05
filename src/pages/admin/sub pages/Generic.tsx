import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Printer, Boxes, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { printElement } from "@/utils/print";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AccessoryProductPayload,
  AccessoryProductForm,
} from "@/components/GenericProduct";
import { api } from "@/lib/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTitle } from "@/context/TitleContext";

interface variant {
  id: string;
  color: string;
  sky: string;
  storageSize: string;
  variantName: string;
}

interface category {
  id: string;
  name: string;
}

interface product {
  id: string;
  name: string;
}

interface StockItem {
  id: string;
  shopId: string;
  shopName?: string;
  variantId: string;
  variantName: variant;
  productName: product;
  brandName: string;
  categoryName: category;
  color?: variant;
  storageSize?: variant;
  barcode?: string;
  serialNumber?: string;
  purchasePrice?: string;
  salePrice: string;
  stockStatus: string;
  isSold: boolean;
  condition: string;
  vendorId?: string;
  sku?: variant;
  notes?: string;
  stock?: number; // ✅ Added missing field
  createdAt: string;
  updatedAt: string;
}

// ✅ Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function GenericProducts() {
  useAuth("catalogGeneric");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const queryClient = useQueryClient();

  const authStorage = localStorage.getItem("auth-storage");
  const authState = authStorage ? JSON.parse(authStorage)?.state : null;

  useEffect(() => {
    setTitle(t("admin.generic.title"));
    return () => setTitle("Business Dashboard");
  }, [setTitle, t]);

  // ✅ Fixed: Proper state management for selectedShopId
  const [selectedShopId, setSelectedShopId] = useState<string>(() => {
    return authState?.currentShop?.id || "";
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<{
    categoryId?: string;
    name?: string;
    ean?: string;
  }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"add" | "return" | "garbage">(
    "add"
  );
  const [stockSearch, setStockSearch] = useState("");
  const [isManageStockOpen, setIsManageStockOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState<StockItem | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useDebounce(searchInput, 500);

  // ✅ Fetch Shops
  const { data: shopsData } = useQuery({
    queryKey: ["/api/shops/my-shops"],
    queryFn: () => api.shops.getMyShops(),
  });

  const shops = useMemo(() => shopsData?.shops || [], [shopsData]);
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined);

  const { data: accessoriesData, isLoading } = useQuery({
    queryKey: [
      "/api/products/catalog/accessories",
      {
        page,
        limit,
        search: debouncedSearch,
        brand: brandFilter,
      },
    ],
    queryFn: () =>
      api.accessoryCatalog.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
        brand: brandFilter || undefined,
      }),
  });

  const products = accessoriesData?.accessories || [];
  const total = accessoriesData?.pagination?.total || 0;

  // ✅ Fetch Vendors
  const { data: vendorsData } = useQuery({
    queryKey: ["/api/vendors", authState?.user?.id],
    queryFn: () => api.vendors.getAll({ userId: authState?.user?.id }),
    enabled: !!authState?.user?.id,
  });
  const searchedProducts = useMemo(() => {
    if (!stockSearch.trim()) return products;

    const q = stockSearch.toLowerCase();

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category?.toLowerCase().includes(q) ?? false)
    );
  }, [stockSearch, products]);

  // ✅ Product Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => api.accessoryCatalog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/products/accessories"],
      });

      toast({ title: "Product Added" });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => {
      toast({
        title: "Error saving product",
        description: JSON.stringify(err?.response?.data || err),
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.update(id, {
        barcode: data.ean,
        salePrice: Number(data.salePrice),
        purchasePrice: Number(data.buyPrice),
        notes: data.name,
      }),
    // In updateProductMutation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });

      toast({ title: "Product Updated" });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
  });
  // ✅ Stock Mutation
  const updateStockMutation = useMutation({
    mutationFn: ({
      id,
      type,
      quantity,
    }: {
      id: string;
      type: "add" | "subtract" | "set";
      quantity: number;
    }) => api.products.updateStock(id, { type, quantity }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/products/catalog/accessories"],
      });
      let title = "";
      if (variables.type === "add") {
        title = "Stock Added";
      } else if (variables.type === "subtract") {
        title = "Stock Removed";
      }
      toast({ title, description: `${variables.quantity} items updated.` });
    },
  });

  const handleStockSubmit = (
    e: React.FormEvent,
    mode: "add" | "return" | "garbage",
    product: any
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const qty = Number(formData.get("quantity"));

    if (isNaN(qty) || qty <= 0) return;

    updateStockMutation.mutate({
      id: product.id,
      type: mode === "add" ? "add" : "subtract",
      quantity: qty,
    });
  };

  const handleSubmitProduct = async (payload: AccessoryProductPayload) => {
    if (!selectedShopId || !payload.variantId || !payload.vendorId) {
      toast({
        title: "Shop, Variant, and Vendor are required",
        variant: "destructive",
      });
      return;
    }
    try {
      createProductMutation.mutate({
        shopId: selectedShopId,
        variantId: payload.variantId,
        salePrice: payload.sellingPrice,
        purchasePrice: payload.purchasePrice,
        quantity: payload.quantity,
        barcode: payload.barcode || null,
        notes: payload.notes || null,
        vendorId: payload.vendorId,
        taxId: payload.taxId,
        lowStockThreshold: payload.lowStockThreshold || 0,
      });
      console.log("Creating accessory:", {
        shopId: selectedShopId,
        variantId: payload.variantId,
        vendorId: payload.vendorId,
      });
    } catch (err) {
      console.error("Error creating product:", err);
      toast({ title: "Failed to create product", variant: "destructive" });
    }
  };

  const handlePrintRow = async (row: any) => {
    const container = document.createElement("div");
    container.id = "product-print-container";
    container.innerHTML = `
      <div style="padding:30px;">
        <h2>Product Details</h2>
        <table><tbody>
          ${Object.entries({
            Category: row.categoryName?.name || "N/A",
            "Product Name": row.productName?.name || row.notes || "N/A",
            "Buy Price": row.purchasePrice || "N/A",
            "Sale Price": row.salePrice || "N/A",
          })
            .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
            .join("")}
        </tbody></table>
      </div>
    `;
    document.body.appendChild(container);
    await printElement("product-print-container", {
      title: `Product - ${row.productName?.name || "Product"}`,
      onAfterPrint: () => document.body.removeChild(container),
    });
  };
  const { data: brandsData, isLoading: brandsLoading } = useQuery<{
    brands: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["/api/products/brands"],
  });

  const brands = useMemo(() => {
    return brandsData?.brands?.map((b) => ({ id: b.id, name: b.name })) || [];
  }, [brandsData]);

  const handleOpenModal = (product?: any) => {
    setCurrentStock(null);

    if (product) {
      setEditingProduct(product);
    } else {
      setEditingProduct(null);
    }

    // Wait until shops are loaded
    if (shops.length > 0) {
      setSelectedShopId(shops[0].id);
    }

    setIsModalOpen(true);
  };

  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none",
      render: (_: any, __: any, index: number) =>
        (page - 1) * limit + index + 1,
    },
    {
      key: "categoryName",
      label: "Category",
      filterType: "select",
      filterOptions: ["Accessory"],
    },
    {
      key: "color",
      label: "Color",
      filterType: "text",
    },
    {
      key: "purchasePrice",
      label: "Buy Price",
      filterType: "none",
    },
    {
      key: "salePrice",
      label: "Sale Price",
      filterType: "none",
    },
    {
      key: "vendorName",
      label: "Vendor",
      filterType: "select",
      filterOptions: vendorsData?.vendors?.map((v) => v.name) || [],
    },
    {
      key: "createdAt",
      label: "Created At",
      filterType: "none",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end flex-col gap-8">
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => handleOpenModal()}
            data-testid="button-create-product"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create New Product</span>
            <span className="sm:hidden">New Product</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsManageStockOpen(true)}
            data-testid="button-manage-stock"
          >
            <Boxes className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Manage Stock</span>
            <span className="sm:hidden">Stock</span>
          </Button>
        </div>

        <div className="flex w-full justify-end">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table / Empty State */}
      {!isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/30">
          <Boxes className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No products to show
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first product to get started.
          </p>
          <Button className="mt-4" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          showActions
          renderActions={(row) => (
            <div className="flex justify-end gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                onClick={() => setViewingProduct(row)}
                title="View"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 hover:bg-amber-100 hover:text-amber-600"
                onClick={() => handlePrintRow(row)}
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                onClick={() => handleOpenModal(row)}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
          onFilterChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
        />
      )}
      {/* Pagination */}
      <TablePagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      {/* Create/Edit Modal */}
      <FormPopupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
      >
        <h2 className="text-2xl font-semibold mb-4">
          {editingProduct
            ? t("admin.generic.modals.product.editTitle")
            : t("admin.generic.modals.product.createTitle")}
        </h2>

        <div className="space-y-4">
          <div className="mb-4">
            <Label>{t("admin.products.select_shop")}</Label>
            <Select value={selectedShopId} onValueChange={setSelectedShopId}>
              <SelectTrigger
                className="w-full"
                data-testid="select-shop-for-mobile"
              >
                <SelectValue placeholder={t("admin.products.select_shop")} />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AccessoryProductForm
            onSubmit={handleSubmitProduct}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}
            initialData={editingProduct}
            shopId={selectedShopId || shops[0]?.id}
            isEditing={!!editingProduct}
          />
        </div>
      </FormPopupModal>

      {/* View Modal */}
      <FormPopupModal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
      >
        {viewingProduct && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">
              {t("admin.generic.modals.viewProduct.title")}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <p>
                <strong>
                  {t("admin.generic.modals.viewProduct.fields.salePrice")}:
                </strong>{" "}
                {viewingProduct.salePrice}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => handlePrintRow(viewingProduct)}
              >
                <Printer className="w-4 h-4 mr-2" />{" "}
                {t("admin.generic.buttons.print")}
              </Button>
              <Button onClick={() => setViewingProduct(null)}>
                {t("admin.generic.buttons.close")}
              </Button>
            </div>
          </div>
        )}
      </FormPopupModal>

      {/* Manage Stock Modal */}
      <FormPopupModal
        isOpen={isManageStockOpen}
        onClose={() => setIsManageStockOpen(false)}
      >
        <h2 className="text-2xl font-semibold mb-4">
          {t("admin.generic.modals.manageStock.title")}
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          {["add", "return", "garbage"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "add" | "return")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-primary"
              }`}
            >
              {t(`admin.generic.modals.manageStock.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder={t(
              "admin.generic.modals.manageStock.searchPlaceholder"
            )}
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Product List */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {searchedProducts.length === 0 && (
            <p className="text-center text-gray-500 text-sm">
              {t("admin.generic.modals.manageStock.noProductsFound")}
            </p>
          )}
          {searchedProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-md p-4 shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold">{product.name}</p>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {t("admin.generic.modals.manageStock.productStock")}:{" "}
                  {product.stock}
                </Badge>
              </div>
              <form
                onSubmit={(e) => handleStockSubmit(e, activeTab, product)}
                className="flex gap-2"
              >
                <Input
                  type="number"
                  name="quantity"
                  placeholder={
                    activeTab === "add"
                      ? t(
                          "admin.generic.modals.manageStock.quantityPlaceholderAdd"
                        )
                      : t(
                          "admin.generic.modals.manageStock.quantityPlaceholderReturn"
                        )
                  }
                  min="1"
                  className="w-32"
                />
                <Button
                  type="submit"
                  variant={
                    activeTab === "add"
                      ? "default"
                      : activeTab === "garbage"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {activeTab === "add"
                    ? t("admin.generic.buttons.add")
                    : activeTab === "return"
                    ? t("admin.generic.buttons.return")
                    : t("admin.generic.buttons.garbage")}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </FormPopupModal>
    </div>
  );
}
