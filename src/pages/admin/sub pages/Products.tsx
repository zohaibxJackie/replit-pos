import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Search, Loader2, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from '@/context/TitleContext';
import { MobileProductForm, MobileProductPayload } from "@/components/MobileProductForm";
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
  type: string;
  status: string;
  imei1?: string;
  imei2?: string;
  mobileCatalogId?: string;
  accessoryCatalogId?: string;
  categoryId?: string;
  vendorId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Shop {
  id: string;
  name: string;
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
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [shopFilter, setShopFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInterStockModalOpen, setIsInterStockModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [imeiInput, setImeiInput] = useState("");
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState<number>(1);
  const [targetShopId, setTargetShopId] = useState("");
  const [isSearchingImei, setIsSearchingImei] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  const { data: shopsData } = useQuery({
    queryKey: ['/api/shops/my-shops'],
    queryFn: () => api.shops.getMyShops(),
  });

  const shops = useMemo(() => shopsData?.shops || [], [shopsData]);

  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/products', { page, limit, search: debouncedSearch, type: typeFilter, status: statusFilter, shopId: shopFilter }],
    queryFn: () => api.products.getAll({
      page,
      limit,
      search: debouncedSearch || undefined,
      type: typeFilter || undefined,
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
        type: p.productType || 'mobile',
        status: p.stock > 0 ? 'active' : 'inactive',
        imei1: p.imei1,
        imei2: p.imei2,
        mobileCatalogId: p.mobileCatalogId,
        accessoryCatalogId: p.accessoryCatalogId,
        categoryId: p.categoryId,
        vendorId: p.vendorId,
        createdAt: p.createdAt || '',
        updatedAt: p.updatedAt || '',
      } as Product;
    });
  }, [productsData, shops]);

  const pagination = productsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const createProductMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.products.create>[0]) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: t("products.product_added"), description: t("products.product_added_desc") });
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: t("products.error"), description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof api.products.update>[1] }) => 
      api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: t("products.product_updated"), description: t("products.product_updated_desc") });
      setIsModalOpen(false);
      setCurrentProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: t("products.error"), description: error.message, variant: "destructive" });
    },
  });

  const stockTransferMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.stockTransfers.create>[0]) => api.stockTransfers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: t("products.stock_transferred"), description: t("products.stock_transferred_desc") });
      setIsInterStockModalOpen(false);
      resetTransferModal();
    },
    onError: (error: Error) => {
      toast({ title: t("products.error"), description: error.message, variant: "destructive" });
    },
  });

  const resetTransferModal = () => {
    setImeiInput("");
    setMatchedProduct(null);
    setTransferQty(1);
    setTargetShopId("");
  };

  const openCreateModal = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const openInterStockModal = () => {
    resetTransferModal();
    setIsInterStockModalOpen(true);
  };

  const handleMobileProductSubmit = (payload: MobileProductPayload) => {
    const productName = `${payload.brand} ${payload.model} ${payload.memory ? payload.memory : ''} ${payload.color}`.trim();
    
    if (currentProduct) {
      updateProductMutation.mutate({
        id: currentProduct.id,
        data: {
          customName: productName,
          salePrice: payload.sellingPrice.toString(),
          imei1: payload.imei,
          imei2: payload.imei2,
          mobileCatalogId: payload.mobileCatalogId,
        }
      });
    } else {
      const shopId = shopFilter || shops[0]?.id;
      if (!shopId) {
        toast({ title: t("products.error"), description: t("products.no_shop_selected"), variant: "destructive" });
        return;
      }
      
      createProductMutation.mutate({
        shopId,
        productType: 'mobile',
        customName: productName,
        salePrice: payload.sellingPrice.toString(),
        stock: 1,
        imei1: payload.imei,
        imei2: payload.imei2,
        mobileCatalogId: payload.mobileCatalogId,
      });
    }
  };

  const handleImeiSearch = useCallback(async (value: string) => {
    setImeiInput(value);
    
    if (value.trim().length < 5) {
      setMatchedProduct(null);
      return;
    }

    setIsSearchingImei(true);
    try {
      const result = await api.stockTransfers.getProductByImei(value.trim());
      if (result?.product) {
        const shop = shops.find(s => s.id === result.product.shopId);
        const productData = result.product;
        setMatchedProduct({
          id: productData.id,
          shopId: productData.shopId,
          shopName: shop?.name || 'Unknown',
          name: productData.customName || `Product ${productData.id.slice(0, 8)}`,
          barcode: productData.barcode,
          price: productData.salePrice || '0',
          stock: productData.stock ?? 0,
          type: productData.productType || 'mobile',
          status: productData.stock > 0 ? 'active' : 'inactive',
          imei1: productData.imei1,
          imei2: productData.imei2,
          mobileCatalogId: productData.mobileCatalogId,
          accessoryCatalogId: productData.accessoryCatalogId,
          categoryId: productData.categoryId,
          vendorId: productData.vendorId,
          createdAt: productData.createdAt || '',
          updatedAt: productData.updatedAt || '',
        });
      } else {
        setMatchedProduct(null);
      }
    } catch {
      setMatchedProduct(null);
    } finally {
      setIsSearchingImei(false);
    }
  }, [shops]);

  const handleTransferSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!matchedProduct) {
      toast({ title: t("products.error"), description: t("products.no_product_found"), variant: "destructive" });
      return;
    }

    if (!targetShopId) {
      toast({ title: t("products.error"), description: t("products.select_target_shop"), variant: "destructive" });
      return;
    }

    if (matchedProduct.shopId === targetShopId) {
      toast({ title: t("products.error"), description: t("products.same_shop_error"), variant: "destructive" });
      return;
    }

    const qty = transferQty > 0 ? transferQty : 1;
    if (qty > matchedProduct.stock) {
      toast({ title: t("products.error"), description: t("products.insufficient_stock"), variant: "destructive" });
      return;
    }

    stockTransferMutation.mutate({
      productId: matchedProduct.id,
      fromShopId: matchedProduct.shopId,
      toShopId: targetShopId,
      quantity: qty,
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const availableTargetShops = useMemo(() => {
    if (!matchedProduct) return shops;
    return shops.filter(s => s.id !== matchedProduct.shopId);
  }, [shops, matchedProduct]);

  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { 
      key: "name", 
      label: t("admin.products.column.product_name"), 
      filterType: "none",
    },
    { 
      key: "imei1", 
      label: t("admin.products.column.imei"), 
      filterType: "none",
      render: (value: string, row: Product) => value || row.imei2 || row.barcode || '-',
    },
    {
      key: "shopName",
      label: t("admin.products.column.shop"),
      filterType: "none",
    },
    {
      key: "stock",
      label: t("admin.products.column.stock"),
      filterType: "none",
      render: (value: number) => (
        <Badge variant={value <= 0 ? "destructive" : "default"}>{value}</Badge>
      ),
    },
    {
      key: "price",
      label: t("admin.products.column.sale_price"),
      filterType: "none",
      render: (value: string) => `PKR ${parseFloat(value).toLocaleString()}`,
    },
    {
      key: "type",
      label: t("admin.products.column.type"),
      filterType: "none",
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("admin.products.search_placeholder")}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="pl-9 w-64"
              data-testid="input-search-products"
            />
          </div>
          
          <Select value={shopFilter} onValueChange={(v) => { setShopFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40" data-testid="select-shop-filter">
              <SelectValue placeholder={t("admin.products.all_shops")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("admin.products.all_shops")}</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32" data-testid="select-type-filter">
              <SelectValue placeholder={t("admin.products.all_types")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("admin.products.all_types")}</SelectItem>
              <SelectItem value="mobile">{t("admin.products.type_mobile")}</SelectItem>
              <SelectItem value="accessory">{t("admin.products.type_accessory")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32" data-testid="select-status-filter">
              <SelectValue placeholder={t("admin.products.all_status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("admin.products.all_status")}</SelectItem>
              <SelectItem value="active">{t("admin.products.status_active")}</SelectItem>
              <SelectItem value="inactive">{t("admin.products.status_inactive")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={openCreateModal} data-testid="button-create-product">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("admin.products.create_new_product")}</span>
            <span className="sm:hidden">{t("admin.products.new")}</span>
          </Button>
          <Button variant="outline" onClick={openInterStockModal} data-testid="button-inter-stock">
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("admin.products.inter_stock_transfer")}</span>
            <span className="sm:hidden">{t("admin.products.transfer")}</span>
          </Button>
        </div>
      </div>

      <div className="flex justify-end items-center mb-4">
        <TablePageSizeSelector
          limit={limit}
          onChange={handlePageSizeChange}
        />
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
          {currentProduct ? t("admin.products.edit_product") : t("admin.products.add_new_mobile")}
        </h2>
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
          shopId={shopFilter || shops[0]?.id}
        />
      </FormPopupModal>

      <FormPopupModal isOpen={isInterStockModalOpen} onClose={() => setIsInterStockModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          {t("admin.products.inter_store_movement")}
        </h2>

        <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4">
          <div>
            <Label>{t("admin.products.enter_imei")}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={imeiInput}
                onChange={(e) => handleImeiSearch(e.target.value)}
                placeholder={t("admin.products.enter_imei_placeholder")}
                required
                data-testid="input-transfer-imei"
              />
              {isSearchingImei && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>

          {matchedProduct ? (
            <div className="border p-3 rounded-md bg-muted/50">
              <p className="font-medium">{matchedProduct.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("admin.products.current_shop")}: {matchedProduct.shopName}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("admin.products.current_stock")}: {matchedProduct.stock}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={matchedProduct.stock}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  placeholder={t("admin.products.enter_quantity")}
                  className="w-32"
                  data-testid="input-transfer-qty"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransferQty(matchedProduct.stock)}
                  data-testid="button-send-all"
                >
                  {t("admin.products.send_all")}
                </Button>
              </div>
            </div>
          ) : imeiInput.length >= 5 && !isSearchingImei ? (
            <p className="text-destructive text-sm">{t("admin.products.no_product_for_imei")}</p>
          ) : null}

          <div>
            <Label>{t("admin.products.send_stock_to")}</Label>
            <Select value={targetShopId} onValueChange={setTargetShopId} disabled={!matchedProduct}>
              <SelectTrigger className="w-full" data-testid="select-target-shop">
                <SelectValue placeholder={t("admin.products.select_shop")} />
              </SelectTrigger>
              <SelectContent>
                {availableTargetShops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsInterStockModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={!matchedProduct || !targetShopId || stockTransferMutation.isPending}
              data-testid="button-submit-transfer"
            >
              {stockTransferMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t("admin.products.transfer_stock")}
            </Button>
          </div>
        </form>
      </FormPopupModal>
    </div>
  );
}
