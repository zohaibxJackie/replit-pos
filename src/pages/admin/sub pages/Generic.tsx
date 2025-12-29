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

export default function GenericProducts() {
  useAuth("catalogGeneric");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle(t("admin.generic.title"));
    return () => setTitle("Business Dashboard");
  }, [setTitle]);

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
  const queryClient = useQueryClient();
  // ✅ Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.categories.getAll(),
  });
  const categoriesList = categoriesData?.categories || [];
  useEffect(() => {
    if (categoriesList.length > 0 && !filters.categoryId) {
      setFilters((prev) => ({
        ...prev,
        categoryId: categoriesList[0].id, // default category
      }));
    }
  }, [categoriesList]);
  const productCategory: "mobile" | "accessory" = "mobile";
  const authStorage = localStorage.getItem("auth-storage");
  const authState = authStorage ? JSON.parse(authStorage)?.state : null;

  const selectedShopId = authState?.currentShop?.id;

  type ProductQueryParams = {
    shopId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    productCategory?: string;
    lowStock?: boolean;
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["/api/products", { page, selectedShopId, limit, ...filters }],
    queryFn: () => {
      if (!selectedShopId) {
        throw new Error("Shop ID is required");
      }

      const params: ProductQueryParams = {
        shopId: selectedShopId,
        page,
        limit,
        search: filters.name || filters.ean,
        productCategory,
      };

      return api.products.getAll(params);
    },
    enabled: !!selectedShopId,
  });

  const products = productsData?.products || [];
  const total = productsData?.pagination?.total || 0;

  const [activeTab, setActiveTab] = useState<"add" | "return" | "garbage">(
    "add"
  );
  const [stockSearch, setStockSearch] = useState("");
  const searchedProducts = useMemo(() => {
    if (!stockSearch.trim()) return products;
    return products.filter(
      (p) =>
        (p.productName || p.customName || "")
          .toLowerCase()
          .includes(stockSearch.toLowerCase()) ||
        (p.barcode || "").toLowerCase().includes(stockSearch.toLowerCase())
    );
  }, [stockSearch, products]);

  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isManageStockOpen, setIsManageStockOpen] = useState(false);

  const [categoryForm, setCategoryForm] = useState({ name: "", newName: "" });
  const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);

  // ✅ Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.categories.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: t("admin.generic.toast.categoryCreated") || "Category Created",
      });
      setIsCreateCategoryOpen(false);
      setCategoryForm({ name: "", newName: "" });
    },
  });
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.categories.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: t("admin.generic.toast.categoryUpdated") || "Category Updated",
      });
      setIsEditCategoryOpen(false);
      setCategoryToEdit(null);
      setCategoryForm({ name: "", newName: "" });
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: t("admin.generic.toast.categoryDeleted") || "Category Deleted",
      });
      setIsEditCategoryOpen(false);
      setCategoryToEdit(null);
    },
  });
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    createCategoryMutation.mutate(categoryForm.name);
  };
  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit || !categoryForm.newName.trim()) return;
    updateCategoryMutation.mutate({
      id: categoryToEdit,
      name: categoryForm.newName,
    });
  };

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
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      let title = "";
      let description = "";
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

  const [formData, setFormData] = useState({
    name: "", // Product name
    categoryId: "", // Selected category UUID
    variantId: "", // Selected variant UUID
    purchasePrice: 0, // Purchase price
    salePrice: 0, // Sale price
    vendorType: "vendor", // "vendor" | "wholesaler" | "customer"
    vendorId: "", // Selected vendor UUID
    taxId: "", // Optional tax UUID
    notes: "", // Optional notes
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product Added" });
      setIsModalOpen(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product Updated" });
      setIsModalOpen(false);
    },
  });

  // ✅ Handle form inputs
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { data: variantsData } = useQuery({
    queryKey: ["/api/variants"],
    queryFn: () => api.variants.getAll(filters),
  });

  console.log(variantsData);

  const { data: vendorsData } = useQuery({
    queryKey: ["/api/vendors"],
    queryFn: () => api.vendors.getAll(),
  });
  console.log(vendorsData);

  const { data: taxesData } = useQuery({
    queryKey: ["/api/taxes"],
    queryFn: () => api.taxes.getAll(),
  });

  const handleOpenModal = (product?: any) => {
    if (product) {
      // Editing existing product
      setEditingProduct(product);

      setFormData({
        name: product.name || "",
        categoryId: product.categoryId || "",
        variantId: product.variantId || "",
        purchasePrice: Number(product.purchasePrice) || 0,
        salePrice: Number(product.salePrice) || 0,
        vendorType: product.vendorType || "vendor",
        vendorId: product.vendorId || "",
        taxId: product.taxId || "",
        notes: product.notes || "",
      });
    } else {
      // Adding new product
      setEditingProduct(null);

      setFormData({
        name: "",
        categoryId: categoriesList[0]?.id || "",
        variantId: variantsData?.variants?.[0]?.id || "", // ✅ Use fetched data
        purchasePrice: 0,
        salePrice: 0,
        vendorType: "vendor",
        vendorId: vendorsData?.vendors?.[0]?.id || "", // ✅ Use fetched data
        taxId: taxesData?.taxes?.[0]?.id || "",
        notes: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedShopId ||
      !formData.categoryId ||
      !formData.variantId ||
      !formData.vendorId
    ) {
      toast({ title: "Shop, Category, Variant, and Vendor are required" });
      return;
    }

    try {
      const payload = {
        shopId: selectedShopId, // from auth
        name: formData.name,
        categoryId: formData.categoryId, // UUID
        variantId: formData.variantId, // UUID
        purchasePrice: Number(formData.purchasePrice),
        salePrice: Number(formData.salePrice),
        vendorType: formData.vendorType, // "vendor" | "wholesaler" | "customer"
        vendorId: formData.vendorId, // UUID
        taxId: formData.taxId || null,
        notes: formData.notes || null,
      };

      createProductMutation.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Product added successfully" });
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        },
      });
    } catch (err) {
      console.error("Error creating product:", err);
      toast({ title: "Failed to create product" });
    }
  };

  // ✅ Print single row
  const handlePrintRow = async (row: any) => {
    const container = document.createElement("div");
    container.id = "product-print-container";
    container.innerHTML = `<div style="padding:30px;">         <h2>Product Details</h2>         <table><tbody>
          ${Object.entries({
            Category: row.categoryName,
            "Product Name": row.productName || row.customName,
            "Buy Price": row.purchasePrice,
            "Sale Price": row.salePrice,
          })
            .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
            .join("")}         </tbody></table>       </div>`;
    document.body.appendChild(container);
    await printElement("product-print-container", {
      title: `Product - ${row.name}`,
      onAfterPrint: () => document.body.removeChild(container),
    });
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
      filterOptions: categoriesData?.categories?.map((c) => c.name) || [],
    },
    {
      key: "name",
      label: "Product Name",
      filterType: "text",
    },
    {
      key: "variantName",
      label: "Variant",
      filterType: "select",
      filterOptions: variantsData?.variants?.map((v) => v.variantName) || [],
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
            onClick={() => setIsCreateCategoryOpen(true)}
            data-testid="button-create-category"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create New Category</span>
            <span className="sm:hidden">New Category</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditCategoryOpen(true)}
            data-testid="button-edit-category"
          >
            <Edit className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Edit Category</span>
            <span className="sm:hidden">Edit Cat.</span>
          </Button>
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
      {/* Create/Edit Modal */}
      <FormPopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <h2 className="text-2xl font-semibold mb-4">
          {editingProduct
            ? t("admin.generic.modals.product.editTitle")
            : t("admin.generic.modals.product.createTitle")}
        </h2>

        <form onSubmit={handleSubmitProduct} className="space-y-4">
          {/* Product Name */}
          <div>
            <Label>{t("admin.generic.modals.product.productName")}</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </div>
          {/* Category */}
          <Label>{t("admin.generic.modals.product.category")}</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, categoryId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoriesList.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Variant */}
          <Label>{t("admin.generic.modals.product.variant")}</Label>
          <Select
            value={formData.variantId}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, variantId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {variantsData?.variants?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.variantName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Vendor */}
          <Label>{t("admin.generic.modals.product.vendor")}</Label>
          <Select
            value={formData.vendorId}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, vendorId: val }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendorsData?.vendors?.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Purchase & Sale Price */}
          <Label>{t("admin.generic.modals.product.buyPrice")}</Label>
          <Input
            type="number"
            value={formData.purchasePrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                purchasePrice: Number(e.target.value),
              }))
            }
          />
          <Label>{t("admin.generic.modals.product.salePrice")}</Label>
          <Input
            type="number"
            value={formData.salePrice}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                salePrice: Number(e.target.value),
              }))
            }
          />
          {/* Hidden/required fields for backend */}
          <input type="hidden" value={selectedShopId} />
          <input type="hidden" value={formData.variantId || "default"} />
          <input type="hidden" value={formData.vendorType || "default"} />
          <input type="hidden" value={formData.taxId || "defaultTaxId"} />
          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t("admin.generic.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                createProductMutation.isPending ||
                updateProductMutation.isPending
              }
            >
              {editingProduct
                ? t("admin.generic.buttons.update")
                : t("admin.generic.buttons.save")}
            </Button>
          </div>
        </form>
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

      {/* Create Category Modal */}
      <FormPopupModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
      >
        <h2 className="text-2xl font-semibold">
          {t("admin.generic.modals.createCategory.title")}
        </h2>
        <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
          <div>
            <label>{t("admin.generic.modals.createCategory.label")}</label>
            <Input
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm((s) => ({ ...s, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateCategoryOpen(false)}
            >
              {t("admin.generic.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending}>
              {t("admin.generic.buttons.create")}
            </Button>
          </div>
        </form>
      </FormPopupModal>

      {/* Edit Category Modal */}
      <FormPopupModal
        isOpen={isEditCategoryOpen}
        onClose={() => setIsEditCategoryOpen(false)}
      >
        <h2 className="text-2xl font-semibold">
          {t("admin.generic.modals.editCategory.title")}
        </h2>
        <form onSubmit={handleEditCategory} className="space-y-4 mt-4">
          <div>
            <label>
              {t("admin.generic.modals.editCategory.selectCategory")}
            </label>
            <Select
              value={categoryToEdit ?? ""}
              onValueChange={(v) => {
                setCategoryToEdit(v || null);
                const cat = categoriesList.find((c) => c.id === v);
                setCategoryForm((s) => ({
                  ...s,
                  name: cat?.name || "",
                  newName: cat?.name || "",
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "admin.generic.modals.editCategory.selectCategory"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>{t("admin.generic.modals.editCategory.newName")}</label>
            <Input
              value={categoryForm.newName}
              onChange={(e) =>
                setCategoryForm((s) => ({ ...s, newName: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditCategoryOpen(false)}
            >
              {t("admin.generic.buttons.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                categoryToEdit && deleteCategoryMutation.mutate(categoryToEdit)
              }
              disabled={!categoryToEdit || deleteCategoryMutation.isPending}
            >
              {t("admin.generic.buttons.delete")}
            </Button>
            <Button
              type="submit"
              disabled={!categoryToEdit || updateCategoryMutation.isPending}
            >
              {t("admin.generic.buttons.save")}
            </Button>
          </div>
        </form>
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
