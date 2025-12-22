import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Loader2, ArrowRightLeft, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from '@/context/TitleContext';
import { MobileProductForm, MobileProductPayload } from "@/components/MobileProductForm";
import InterStockTransferModal from "@/components/InterStockTransferModal";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface variant {
  id: string;
  color: string;
  sky: string;
  storageSize: string;
  variantName: string;
}

interface product {
  id: string;
  name: string;
}
interface category {
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
  primaryImei?: string;
  secondaryImei?: string;
  serialNumber?: string;
  purchasePrice?: string;
  salePrice: string;
  stockStatus: string;
  isSold: boolean;
  condition: string;
  vendorId?: string;
  sku?: variant;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function Products() {
  useAuth("catalogProducts");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const queryClient = useQueryClient();

  useEffect(() => {
    setTitle(t("admin.products.title"));
    return () => setTitle('Business Dashboard');
  }, [setTitle, t]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [shopFilter, setShopFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInterStockModalOpen, setIsInterStockModalOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState<StockItem | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<StockItem | null>(null);

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: shopsData } = useQuery({
    queryKey: ['/api/shops/my-shops'],
    queryFn: () => api.shops.getMyShops(),
  });

  const shops = useMemo(() => shopsData?.shops || [], [shopsData]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['/api/products', { page, limit, search: debouncedSearch, productCategory: 'mobile', status: statusFilter, shopId: shopFilter }],
    queryFn: () => api.products.getAll({
      page,
      limit,
      search: debouncedSearch || undefined,
      productCategory: 'mobile',
      status: statusFilter || undefined,
      shopId: shopFilter || undefined,
    }),
  });

  const stockItems = useMemo(() => {
    const productList = productsData?.products || [];
    return productList.map(p => {
      const shop = shops.find(s => s.id === p.shopId);
      return {
        id: p.id,
        shopId: p.shopId,
        shopName: shop?.name || 'Unknown',
        variantId: p.variantId || '',
        variantName: p.variant.variantName || p.customName || `Stock ${p.id.slice(0, 8)}`,
        productName: p.product.name || '',
        brandName: p.brand.name || '',
        categoryName: p.category.name || '',
        color: p.variant.color || '-',
        storageSize: p.variant.storageSize || '',
        barcode: p.barcode,
        primaryImei: p.primaryImei || p.imei1,
        secondaryImei: p.secondaryImei || p.imei2,
        serialNumber: p.serialNumber,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice || '0',
        stockStatus: p.stockStatus,
        isSold: p.isSold || false,
        condition: p.condition || 'new',
        vendorId: p.vendorId,
        sku: p.variant.sku,
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      } as StockItem;
    });
  }, [productsData, shops]);

  const hasShops = shops.length > 0;

  const pagination = productsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createProductMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.products.create>[0]) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: t("admin.products.product_added"), description: t("admin.products.product_added_desc") });
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: t("admin.products.error"), description: error.message, variant: "destructive" });
    },
  });

  const bulkCreateProductMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.products.bulkCreate>[0]) => api.products.bulkCreate(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ 
        title: t("admin.products.bulk_products_added"), 
        description: t("admin.products.bulk_products_added_desc", { count: result.count }) 
      });
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: t("admin.products.error"), description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.products.update>[1] }) => 
      api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: t("admin.products.product_updated"), description: t("admin.products.product_updated_desc") });
      setIsModalOpen(false);
      setCurrentStock(null);
    },
    onError: (error: Error) => {
      toast({ title: t("admin.products.error"), description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: t("admin.products.product_deleted"), description: t("admin.products.product_deleted_desc") });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: t("admin.products.error"), description: error.message, variant: "destructive" });
    },
  });


  const openCreateModal = () => {
    setCurrentStock(null);
    setSelectedShopId(shops[0]?.id || "");
    setIsModalOpen(true);
  };

  const openEditModal = (stock: StockItem) => {
    setCurrentStock(stock);
    setUpdateFormData({
      primaryImei: stock.primaryImei || '',
      secondaryImei: stock.secondaryImei || '',
      serialNumber: stock.serialNumber || '',
      barcode: stock.barcode || '',
      purchasePrice: stock.purchasePrice ? parseFloat(stock.purchasePrice) : undefined,
      salePrice: parseFloat(stock.salePrice),
      notes: stock.notes || '',
      lowStockThreshold: 5,
    });
    setUpdateErrors({});
    setIsModalOpen(true);
  };

  const openInterStockModal = () => {
    setIsInterStockModalOpen(true);
  };

  const openDeleteConfirm = (stock: StockItem) => {
    setProductToDelete(stock);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  const handleMobileProductSubmit = (payload: MobileProductPayload) => {
    if (!selectedShopId) {
      toast({ title: t("admin.products.error"), description: t("admin.products.no_shop_selected"), variant: "destructive" });
      return;
    }
    
    if (payload.quantity && payload.quantity > 1 && payload.imeis) {
      bulkCreateProductMutation.mutate({
        shopId: selectedShopId,
        variantId: payload.variantId,
        salePrice: payload.sellingPrice,
        purchasePrice: payload.purchasePrice,
        quantity: payload.quantity,
        condition: payload.condition,
        notes: payload.notes || null,
        vendorId: payload.vendorId || null,
        vendorType: payload.vendorType || 'vendor',
        imeis: payload.imeis.map(e => ({ 
          imei1: e.imei1, 
          imei2: e.imei2 || null,
        })),
      });
    } else {
      createProductMutation.mutate({
        shopId: selectedShopId,
        variantId: payload.variantId,
        salePrice: payload.sellingPrice,
        purchasePrice: payload.purchasePrice,
        primaryImei: payload.imei,
        secondaryImei: payload.imei2,
        serialNumber: payload.serialNumber || null,
        barcode: payload.barcode || null,
        condition: payload.condition,
        notes: payload.notes || null,
        vendorId: payload.vendorId || null,
        vendorType: payload.vendorType || 'vendor',
        taxId: payload.taxId || undefined,
        lowStockThreshold: payload.lowStockThreshold || 0
      });
    }
  };

  const [updateFormData, setUpdateFormData] = useState<{
    primaryImei?: string;
    secondaryImei?: string;
    serialNumber?: string;
    barcode?: string;
    purchasePrice?: number;
    salePrice?: number;
    notes?: string;
    taxId?: string;
    lowStockThreshold?: number;
  }>({});
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const { data: taxesData } = useQuery({
    queryKey: ['/api/taxes'],
    queryFn: () => api.taxes.getAll(),
  });

  const taxes = (taxesData?.taxes || []) as Array<{ id: string; name: string }>;

  const handleUpdateFieldChange = (field: string, value: any) => {
    setUpdateFormData(prev => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
    if (updateErrors[field]) {
      setUpdateErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateUpdateForm = () => {
    const newErrors: Record<string, string> = {};

    if (updateFormData.purchasePrice !== undefined && updateFormData.purchasePrice < 0) {
      newErrors.purchasePrice = "Purchase price cannot be negative";
    }

    if (updateFormData.salePrice !== undefined && updateFormData.salePrice < 0) {
      newErrors.salePrice = "Sale price cannot be negative";
    }

    if (updateFormData.primaryImei && updateFormData.secondaryImei && updateFormData.primaryImei === updateFormData.secondaryImei) {
      newErrors.secondaryImei = "Primary and Secondary IMEI cannot be the same";
    }

    if (updateFormData.lowStockThreshold !== undefined && updateFormData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = "Low stock threshold cannot be negative";
    }

    setUpdateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStock || !validateUpdateForm()) return;
    
    updateProductMutation.mutate({
      id: currentStock.id,
      data: updateFormData
    });
  };


  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  const handleColumnFilterChange = useCallback((filters: Record<string, string>) => {
    if (filters.variantName !== undefined) {
      setSearchInput(filters.variantName);
    }
    if (filters.primaryImei !== undefined) {
      setSearchInput(filters.primaryImei);
    }
    if (filters.stockStatus !== undefined) {
      setStatusFilter(filters.stockStatus);
    }
    if (filters.shopName !== undefined) {
      setShopFilter(filters.shopName);
    }
    setPage(1);
  }, []);

  const shopFilterOptions = useMemo(() => {
    return shops.map(shop => ({ value: shop.id, label: shop.name }));
  }, [shops]);

  const getStatusBadge = (status: string, isSold: boolean) => {
    if (isSold) {
      return <Badge variant="secondary" data-testid="badge-sold">Sold</Badge>;
    }
    switch (status) {
      case 'in_stock':
        return <Badge variant="default" data-testid="badge-in-stock">In Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive" data-testid="badge-out-of-stock">Out of Stock</Badge>;
      case 'reserved':
        return <Badge variant="outline" data-testid="badge-reserved">Reserved</Badge>;
      case 'defective':
        return <Badge variant="destructive" data-testid="badge-defective">Defective</Badge>;
      case 'transferred':
        return <Badge variant="secondary" data-testid="badge-transferred">Transferred</Badge>;
      default:
        return <Badge variant="outline" data-testid="badge-unknown">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none" as const,
      render: (_: unknown, __: unknown, index: number) => (page - 1) * limit + index + 1,
    },
    { 
      key: "variantName", 
      label: t("admin.products.column.product_name"), 
      filterType: "text" as const,
    },
    {
      key: "shopName",
      label: t("admin.products.column.shop"),
      filterType: "select" as const,
      filterOptions: shopFilterOptions,
    },
    {
      key: "color",
      label: t("admin.products.column.color"),
      filterType: "none" as const,
    },
    { 
      key: "primaryImei", 
      label: t("admin.products.column.imei"), 
      filterType: "text" as const,
      render: (value: string, row: StockItem) => value || row.secondaryImei || row.barcode || row.serialNumber || '-',
    },
    {
      key: "stockStatus",
      label: t("admin.products.column.stock"),
      filterType: "select" as const,
      filterOptions: ["in_stock", "out_of_stock", "reserved", "sold", "defective"],
      render: (value: string, row: StockItem) => getStatusBadge(value, row.isSold),
    },
    {
      key: "salePrice",
      label: t("admin.products.column.sale_price"),
      filterType: "none" as const,
      render: (value: string) => `PKR ${parseFloat(value || '0').toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            onClick={openCreateModal} 
            disabled={!hasShops}
            title={!hasShops ? t("admin.products.create_shop_first") : undefined}
            data-testid="button-add-mobile"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("admin.products.add_mobile")}</span>
            <span className="sm:hidden">{t("admin.products.new")}</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={openInterStockModal} 
            disabled={!hasShops}
            data-testid="button-inter-stock"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("admin.products.inter_stock_transfer")}</span>
            <span className="sm:hidden">{t("admin.products.transfer")}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <TablePageSizeSelector
            limit={limit}
            onChange={handlePageSizeChange}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={stockItems}
          showActions
          onFilterChange={handleColumnFilterChange}
          renderActions={(row) => (
            <div className="flex justify-end gap-1 relative z-10">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(row);
                }}
                title={t("common.edit")}
                data-testid={`button-edit-product-${row.id}`}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteConfirm(row);
                }}
                title={t("common.delete")}
                data-testid={`button-delete-product-${row.id}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          )}
        />
      )}

      <div className="mt-4">
        <TablePagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          onPageChange={handlePageChange}
        />
      </div>

      <FormPopupModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentStock(null); }}>
        {currentStock ? (
          <form onSubmit={handleUpdateProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryImei">{t("admin.products.form.primary_imei")}</Label>
              <Input
                id="primaryImei"
                type="text"
                placeholder="Enter primary IMEI"
                value={updateFormData.primaryImei || ''}
                onChange={(e) => handleUpdateFieldChange("primaryImei", e.target.value)}
                data-testid="input-primary-imei-update"
              />
              {updateErrors.primaryImei && (
                <p className="text-sm text-destructive">{updateErrors.primaryImei}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryImei">{t("admin.products.form.secondary_imei")}</Label>
              <Input
                id="secondaryImei"
                type="text"
                placeholder="Enter secondary IMEI (optional)"
                value={updateFormData.secondaryImei || ''}
                onChange={(e) => handleUpdateFieldChange("secondaryImei", e.target.value)}
                data-testid="input-secondary-imei-update"
              />
              {updateErrors.secondaryImei && (
                <p className="text-sm text-destructive">{updateErrors.secondaryImei}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">{t("admin.products.form.serial_number")}</Label>
              <Input
                id="serialNumber"
                type="text"
                placeholder="Enter serial number (optional)"
                value={updateFormData.serialNumber || ''}
                onChange={(e) => handleUpdateFieldChange("serialNumber", e.target.value)}
                data-testid="input-serial-number-update"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">{t("admin.products.form.barcode")}</Label>
              <Input
                id="barcode"
                type="text"
                placeholder="Enter barcode (optional)"
                value={updateFormData.barcode || ''}
                onChange={(e) => handleUpdateFieldChange("barcode", e.target.value)}
                data-testid="input-barcode-update"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">{t("admin.products.form.purchase_price")}</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="0"
                  step="0.01"
                  value={updateFormData.purchasePrice ?? ''}
                  onChange={(e) => handleUpdateFieldChange("purchasePrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                  data-testid="input-purchase-price-update"
                />
                {updateErrors.purchasePrice && (
                  <p className="text-sm text-destructive">{updateErrors.purchasePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">{t("admin.products.form.sale_price")}</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="0"
                  step="0.01"
                  value={updateFormData.salePrice ?? ''}
                  onChange={(e) => handleUpdateFieldChange("salePrice", e.target.value ? parseFloat(e.target.value) : undefined)}
                  data-testid="input-sale-price-update"
                />
                {updateErrors.salePrice && (
                  <p className="text-sm text-destructive">{updateErrors.salePrice}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">{t("admin.products.form.tax")}</Label>
              <Select
                value={updateFormData.taxId || "none"}
                onValueChange={(value) =>
                  handleUpdateFieldChange("taxId", value === "none" ? undefined : value)
                }
              >
                <SelectTrigger id="taxId" data-testid="select-tax-update">
                  <SelectValue placeholder={t("admin.products.form.select_tax")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t("admin.products.form.no_tax")}
                  </SelectItem>
                  {taxes.map((tax) => (
                    <SelectItem key={tax.id} value={tax.id}>
                      {tax.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">{t("admin.products.form.low_stock_threshold")}</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                placeholder="5"
                value={updateFormData.lowStockThreshold ?? ''}
                onChange={(e) => handleUpdateFieldChange("lowStockThreshold", e.target.value ? parseInt(e.target.value) : undefined)}
                data-testid="input-low-stock-threshold-update"
              />
              {updateErrors.lowStockThreshold && (
                <p className="text-sm text-destructive">{updateErrors.lowStockThreshold}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("admin.products.form.notes")}</Label>
              <Textarea
                id="notes"
                placeholder="Enter notes (optional)"
                value={updateFormData.notes || ''}
                onChange={(e) => handleUpdateFieldChange("notes", e.target.value)}
                data-testid="textarea-notes-update"
                className="min-h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsModalOpen(false); setCurrentStock(null); }}
                disabled={updateProductMutation.isPending}
                data-testid="button-cancel-update"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateProductMutation.isPending}
                data-testid="button-update-product"
              >
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("common.updating")}
                  </>
                ) : (
                  t("common.update")
                )}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <Label>{t("admin.products.select_shop")}</Label>
              <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                <SelectTrigger className="w-full" data-testid="select-shop-for-mobile">
                  <SelectValue placeholder={t("admin.products.select_shop")} />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <MobileProductForm
              onSubmit={handleMobileProductSubmit}
              onCancel={() => { setIsModalOpen(false); setCurrentStock(null); }}
              initialData={undefined}
              shopId={selectedShopId || shops[0]?.id}
              isEditing={false}
            />
          </>
        )}
      </FormPopupModal>

      <InterStockTransferModal 
        isOpen={isInterStockModalOpen}
        onClose={() => setIsInterStockModalOpen(false)}
        shops={shops}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent data-testid="dialog-delete-product-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.products.delete_product")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.products.delete_confirmation", { 
                name: productToDelete?.variantName || "this product" 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              {t("admin.products.delete_warning")}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <AlertDialogCancel 
              disabled={deleteProductMutation.isPending}
              data-testid="button-cancel-delete"
            >
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteProductMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.deleting")}
                </>
              ) : (
                t("common.delete")
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
