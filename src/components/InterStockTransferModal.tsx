import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, ArrowRight, Package, Search, Store, ArrowRightLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

interface Shop {
  id: string;
  name: string;
}

interface Product {
  id: string;
  shopId: string;
  variantName?: string;
  productName?: string;
  brandName?: string;
  customName?: string;
  barcode?: string;
  salePrice: string;
  stock?: number;
  imei1?: string;
  primaryImei?: string;
  imei2?: string;
  secondaryImei?: string;
  sku?: string;
  categoryName?: string;
  color?: string;
  storageSize?: string;
  mobileCatalogId?: string;
}

interface InterStockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
}

export default function InterStockTransferModal({ isOpen, onClose, shops }: InterStockTransferModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sourceShopId, setSourceShopId] = useState<string>("");
  const [targetShopId, setTargetShopId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transferQty, setTransferQty] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen && shops.length > 0 && !sourceShopId) {
      setSourceShopId(shops[0].id);
    }
  }, [isOpen, shops, sourceShopId]);

  const resetModal = () => {
    setSelectedProduct(null);
    setTransferQty(1);
    setSearchQuery("");
    setTargetShopId("");
  };

  const handleClose = () => {
    resetModal();
    setSourceShopId(shops[0]?.id || "");
    onClose();
  };

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products', { shopId: sourceShopId, search: searchQuery, limit: 100, productCategory: 'mobile' }],
    queryFn: () => api.products.getAll({ 
      shopId: sourceShopId, 
      search: searchQuery,
      limit: 100,
      productCategory: 'mobile'
    }),
    enabled: !!sourceShopId && isOpen,
  });

  const products = productsData?.products || [];

  const availableTargetShops = useMemo(() => {
    return shops.filter(s => s.id !== sourceShopId);
  }, [shops, sourceShopId]);

  const sourceShopName = shops.find(s => s.id === sourceShopId)?.name || "";
  const targetShopName = shops.find(s => s.id === targetShopId)?.name || "";

  const stockTransferMutation = useMutation({
    mutationFn: async (data: { productId: string; fromShopId: string; toShopId: string; quantity: number; notes?: string }) => {
      const response = await fetch('/api/stock-transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: data.productId,
          fromShopId: data.fromShopId,
          toShopId: data.toShopId,
          quantity: data.quantity,
          notes: data.notes
        })
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ 
        title: t("admin.products.stock_transferred"), 
        description: t("admin.products.stock_transferred_desc") 
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({ title: t("admin.products.error"), description: error.message, variant: "destructive" });
    },
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setTransferQty(1);
  };

  const handleSourceShopChange = (shopId: string) => {
    setSourceShopId(shopId);
    setSelectedProduct(null);
    setTargetShopId("");
    setSearchQuery("");
  };

  const handleInitiateTransfer = () => {
    if (!selectedProduct) {
      toast({ title: t("admin.products.error"), description: t("admin.products.no_product_found"), variant: "destructive" });
      return;
    }

    if (!targetShopId) {
      toast({ title: t("admin.products.error"), description: t("admin.products.select_target_shop"), variant: "destructive" });
      return;
    }

    if (transferQty <= 0 || transferQty > (selectedProduct.stock ?? 0)) {
      toast({ title: t("admin.products.error"), description: t("admin.products.insufficient_stock"), variant: "destructive" });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmTransfer = () => {
    if (!selectedProduct || !targetShopId) return;
    
    stockTransferMutation.mutate({
      productId: selectedProduct.id,
      fromShopId: sourceShopId,
      toShopId: targetShopId,
      quantity: transferQty,
    });
    setShowConfirmation(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{t("admin.products.inter_stock_transfer")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {t("admin.products.inter_store_movement")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-xs sm:text-sm">
                  <Store className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{t("admin.products.transfer_from_shop")}</span>
                </Label>
                <Select value={sourceShopId} onValueChange={handleSourceShopChange}>
                  <SelectTrigger data-testid="select-source-shop" className="text-sm">
                    <SelectValue placeholder={t("admin.products.select_shop")} />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-xs sm:text-sm">
                  <Store className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{t("admin.products.transfer_to_shop")}</span>
                </Label>
                <Select value={targetShopId} onValueChange={setTargetShopId} disabled={!selectedProduct}>
                  <SelectTrigger data-testid="select-target-shop" className="text-sm">
                    <SelectValue placeholder={t("admin.products.select_shop")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargetShops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-xs sm:text-sm">
                <Search className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{t("admin.products.search_products")}</span>
              </Label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.products.search_by_name_imei")}
                data-testid="input-search-products"
                className="text-sm"
              />
            </div>

            <div className="flex-1 min-h-0">
              <Label className="mb-1.5 block text-xs sm:text-sm">{t("admin.products.select_product")}</Label>
              <ScrollArea className="h-32 sm:h-40 border rounded-md">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-50" />
                    <p>{t("admin.products.no_products_in_stock")}</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {products.map((product) => (
                      <Card
                        key={product.id}
                        className={`p-3 cursor-pointer transition-colors hover-elevate ${
                          selectedProduct?.id === product.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => handleProductSelect(product)}
                        data-testid={`card-product-${product.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {product.brandName} {product.variantName || product.productName || product.customName || 'Product'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.color && `${product.color} `}
                              {product.storageSize && `${product.storageSize} `}
                              {(product.primaryImei || product.imei1) && `IMEI: ${product.primaryImei || product.imei1}`}
                              {(product.secondaryImei || product.imei2) && ` / ${product.secondaryImei || product.imei2}`}
                              {!product.primaryImei && !product.imei1 && product.barcode && `Barcode: ${product.barcode}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={(product.stock ?? 0) <= 5 ? "destructive" : "default"}>
                              {t("admin.products.stock")}: {product.stock ?? 0}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {selectedProduct && (
              <Card className="p-3 sm:p-4 bg-muted/50">
                <div className="space-y-3">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base">{t("admin.products.selected_product")}</h4>
                    <p className="text-xs sm:text-sm truncate">
                      {selectedProduct.brandName} {selectedProduct.variantName || selectedProduct.productName || selectedProduct.customName || 'Product'}
                    </p>
                    {(selectedProduct.color || selectedProduct.storageSize) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedProduct.color && `${selectedProduct.color}`}
                        {selectedProduct.color && selectedProduct.storageSize && ' - '}
                        {selectedProduct.storageSize && `${selectedProduct.storageSize}`}
                      </p>
                    )}
                    {(selectedProduct.primaryImei || selectedProduct.imei1) && (
                      <p className="text-xs text-muted-foreground truncate">IMEI: {selectedProduct.primaryImei || selectedProduct.imei1}</p>
                    )}
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {t("admin.products.available_stock")}: <span className="font-medium">{selectedProduct.stock ?? 0}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Label htmlFor="transfer-qty" className="whitespace-nowrap text-xs sm:text-sm">{t("admin.products.quantity")}:</Label>
                    <Input
                      id="transfer-qty"
                      type="number"
                      min="1"
                      max={selectedProduct.stock ?? 1}
                      value={transferQty}
                      onChange={(e) => setTransferQty(Number(e.target.value) || 1)}
                      className="w-16 sm:w-20 text-sm"
                      data-testid="input-transfer-qty"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTransferQty(selectedProduct.stock ?? 1)}
                      data-testid="button-send-all"
                    >
                      {t("admin.products.send_all")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter className="mt-3 sm:mt-4 flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleInitiateTransfer}
              disabled={!selectedProduct || !targetShopId || stockTransferMutation.isPending}
              data-testid="button-submit-transfer"
              className="w-full sm:w-auto"
            >
              {stockTransferMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              <span className="truncate">{t("admin.products.transfer_stock")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="w-[90vw] p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">{t("admin.products.confirm_transfer")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-xs sm:text-sm">
              <p>{t("admin.products.confirm_transfer_message")}</p>
              <div className="mt-3 p-2.5 sm:p-3 bg-muted rounded-md space-y-1 text-xs sm:text-sm">
                <p className="truncate"><strong>{t("admin.products.product")}:</strong> {selectedProduct?.customName || `Product ${selectedProduct?.id.slice(0, 8)}`}</p>
                <p><strong>{t("admin.products.quantity")}:</strong> {transferQty}</p>
                <p className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <strong className="truncate max-w-[100px] sm:max-w-none">{sourceShopName}</strong>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <strong className="truncate max-w-[100px] sm:max-w-none">{targetShopName}</strong>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmTransfer}
              data-testid="button-confirm-transfer"
              className="w-full sm:w-auto"
            >
              {stockTransferMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t("admin.products.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
