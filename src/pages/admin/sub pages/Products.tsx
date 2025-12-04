import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Loader2, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from '@/context/TitleContext';
import { MobileProductForm, MobileProductPayload } from "@/components/MobileProductForm";
import InterStockTransferModal from "@/components/InterStockTransferModal";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  shopId: string;
  shopName?: string;
  name: string;
  barcode?: string;
  price: string;
  stock: number;
  categoryId: string;
  status: string;
  imei1?: string;
  imei2?: string;
  mobileCatalogId?: string;
  accessoryCatalogId?: string;
  vendorId?: string;
  sku?: string;
  color?: string;
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
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>("");

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: shopsData } = useQuery({
    queryKey: ['/api/shops/my-shops'],
    queryFn: () => api.shops.getMyShops(),
  });

  const shops = useMemo(() => shopsData?.shops || [], [shopsData]);

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/products', { page, limit, search: debouncedSearch, categoryId: categoryFilter, status: statusFilter, shopId: shopFilter }],
    queryFn: () => api.products.getAll({
      page,
      limit,
      search: debouncedSearch || undefined,
      categoryId: categoryFilter || undefined,
      status: statusFilter || undefined,
      shopId: shopFilter || undefined,
    }),
  });

  const products = useMemo(() => {
    const productList = productsData?.products || [];
    return productList.map(p => {
      const shop = shops.find(s => s.id === p.shopId);
      return {
        id: p.id,
        shopId: p.shopId,
        shopName: shop?.name || 'Unknown',
        name: p.customName || `Product ${p.id.slice(0, 8)}`,
        barcode: p.barcode,
        price: p.salePrice || '0',
        stock: p.stock ?? 0,
        categoryId: p.categoryId || 'mobile',
        status: p.stock > 0 ? 'active' : 'inactive',
        imei1: p.imei1,
        imei2: p.imei2,
        mobileCatalogId: p.mobileCatalogId,
        accessoryCatalogId: p.accessoryCatalogId,
        vendorId: p.vendorId,
        sku: p.sku,
        color: p.mobileCatalog?.color || '-',
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      } as Product;
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
      setCurrentProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: t("admin.products.error"), description: error.message, variant: "destructive" });
    },
  });


  const openCreateModal = () => {
    setCurrentProduct(null);
    setSelectedShopId(shops[0]?.id || "");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const openInterStockModal = () => {
    setIsInterStockModalOpen(true);
  };

  const handleMobileProductSubmit = (payload: MobileProductPayload) => {
    const productName = `${payload.brand} ${payload.model} ${payload.memory ? payload.memory : ''} ${payload.color}`.trim();
    
    if (currentProduct) {
      updateProductMutation.mutate({
        id: currentProduct.id,
        data: {
          customName: productName,
          salePrice: payload.sellingPrice,
          imei1: payload.imei,
          imei2: payload.imei2,
          mobileCatalogId: payload.mobileCatalogId,
        }
      });
    } else {
      if (!selectedShopId) {
        toast({ title: t("admin.products.error"), description: t("admin.products.no_shop_selected"), variant: "destructive" });
        return;
      }
      
      if (payload.quantity && payload.quantity > 1 && payload.imeis) {
        bulkCreateProductMutation.mutate({
          shopId: selectedShopId,
          categoryId: 'mobile',
          customName: productName,
          salePrice: payload.sellingPrice,
          purchasePrice: payload.purchasePrice,
          mobileCatalogId: payload.mobileCatalogId,
          quantity: payload.quantity,
          imeis: payload.imeis.map(e => ({ 
            imei1: e.imei1, 
            imei2: e.imei2 || null 
          })),
        });
      } else {
        createProductMutation.mutate({
          shopId: selectedShopId,
          categoryId: 'mobile',
          customName: productName,
          salePrice: payload.sellingPrice,
          purchasePrice: payload.purchasePrice,
          stock: 1,
          imei1: payload.imei,
          imei2: payload.imei2,
          mobileCatalogId: payload.mobileCatalogId,
        });
      }
    }
  };


  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  const handleColumnFilterChange = useCallback((filters: Record<string, string>) => {
    if (filters.name !== undefined) {
      setSearchInput(filters.name);
    }
    if (filters.imei1 !== undefined) {
      setSearchInput(filters.imei1);
    }
    if (filters.stock !== undefined) {
      setStatusFilter(filters.stock === "in_stock" ? "active" : filters.stock === "out_of_stock" ? "inactive" : "");
    }
    setPage(1);
  }, []);

  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none" as const,
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { 
      key: "name", 
      label: t("admin.products.column.product_name"), 
      filterType: "text" as const,
    },
    {
      key: "shopName",
      label: t("admin.products.column.shop"),
      filterType: "none" as const,
    },
    {
      key: "color",
      label: t("admin.products.column.color"),
      filterType: "none" as const,
    },
    { 
      key: "imei1", 
      label: t("admin.products.column.imei"), 
      filterType: "text" as const,
      render: (value: string, row: Product) => value || row.imei2 || row.barcode || '-',
    },
    {
      key: "stock",
      label: t("admin.products.column.stock"),
      filterType: "select" as const,
      filterOptions: ["in_stock", "out_of_stock"],
      render: (value: number) => (
        <Badge variant={value <= 0 ? "destructive" : "default"}>{value}</Badge>
      ),
    },
    {
      key: "price",
      label: t("admin.products.column.sale_price"),
      filterType: "none" as const,
      render: (value: string) => `PKR ${parseFloat(value).toLocaleString()}`,
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
          <Select value={shopFilter} onValueChange={(val) => { setShopFilter(val === 'all' ? '' : val); setPage(1); }}>
            <SelectTrigger className="w-[180px]" data-testid="select-shop-filter">
              <SelectValue placeholder={t("admin.products.filter_by_shop")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.products.all_shops")}</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          data={products}
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

      <FormPopupModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentProduct(null); }}>
        <h2 className="text-2xl font-semibold mb-4">
          {currentProduct ? t("admin.products.edit_product") : t("admin.products.add_mobile")}
        </h2>
        
        {!currentProduct && (
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
        )}
        
        <MobileProductForm
          onSubmit={handleMobileProductSubmit}
          onCancel={() => { setIsModalOpen(false); setCurrentProduct(null); }}
          initialData={currentProduct ? {
            brand: '',
            model: currentProduct.name,
            color: '',
            imei: currentProduct.imei1 || '',
            imei2: currentProduct.imei2,
            sellingPrice: parseFloat(currentProduct.price),
          } : undefined}
          shopId={selectedShopId || shops[0]?.id}
          isEditing={!!currentProduct}
        />
      </FormPopupModal>

      <InterStockTransferModal 
        isOpen={isInterStockModalOpen}
        onClose={() => setIsInterStockModalOpen(false)}
        shops={shops}
      />
    </div>
  );
}
