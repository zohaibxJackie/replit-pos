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

interface StockItem {
  id: string;
  shopId: string;
  shopName?: string;
  variantId: string;
  variantName: string;
  productName: string;
  brandName: string;
  categoryName: string;
  color?: string;
  storageSize?: string;
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
  sku?: string;
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
      console.log(p)
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
  // console.log(stockItems)

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


  const openCreateModal = () => {
    setCurrentStock(null);
    setSelectedShopId(shops[0]?.id || "");
    setIsModalOpen(true);
  };

  const openEditModal = (stock: StockItem) => {
    setCurrentStock(stock);
    setIsModalOpen(true);
  };

  const openInterStockModal = () => {
    setIsInterStockModalOpen(true);
  };

  const handleMobileProductSubmit = (payload: MobileProductPayload) => {
    const productName = `${payload.brand} ${payload.model} ${payload.memory ? payload.memory : ''} ${payload.color}`.trim();
    
    if (currentStock) {
      updateProductMutation.mutate({
        id: currentStock.id,
        data: {
          salePrice: payload.sellingPrice,
          primaryImei: payload.imei,
          secondaryImei: payload.imei2,
          variantId: payload.variantId,
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
          categoryId: payload.categoryId || 'mobile',
          variantId: payload.variantId,
          salePrice: payload.sellingPrice,
          purchasePrice: payload.purchasePrice,
          quantity: payload.quantity,
          imeis: payload.imeis.map(e => ({ 
            primaryImei: e.imei1, 
            secondaryImei: e.imei2 || null 
          })),
        });
      } else {
        createProductMutation.mutate({
          shopId: selectedShopId,
          categoryId: payload.categoryId || 'mobile',
          variantId: payload.variantId,
          salePrice: payload.sellingPrice,
          purchasePrice: payload.purchasePrice,
          primaryImei: payload.imei,
          secondaryImei: payload.imei2,
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
        <h2 className="text-2xl font-semibold mb-4">
          {currentStock ? t("admin.products.edit_product") : t("admin.products.add_mobile")}
        </h2>
        
        {!currentStock && (
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
          onCancel={() => { setIsModalOpen(false); setCurrentStock(null); }}
          initialData={currentStock ? {
            brand: currentStock.brandName || '',
            model: currentStock.variantName,
            color: currentStock.color || '',
            memory: currentStock.storageSize,
            imei: currentStock.primaryImei || '',
            imei2: currentStock.secondaryImei,
            sellingPrice: parseFloat(currentStock.salePrice),
            purchasePrice: currentStock.purchasePrice ? parseFloat(currentStock.purchasePrice) : undefined,
            variantId: currentStock.variantId,
          } : undefined}
          shopId={selectedShopId || shops[0]?.id}
          isEditing={!!currentStock}
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
