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
  customName?: string;
  barcode?: string;
  salePrice: string;
  stock: number;
  imei1?: string;
  imei2?: string;
  categoryId: string;
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
    queryKey: ['/api/products', { shopId: sourceShopId, limit: 100 }],
    queryFn: () => api.products.getAll({ shopId: sourceShopId, limit: 100 }),
    enabled: !!sourceShopId && isOpen,
  });

  const filteredProducts = useMemo(() => {
    const products = productsData?.products || [];
    if (!searchQuery) return products.filter(p => p.stock > 0);
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.stock > 0 && (
        p.customName?.toLowerCase().includes(query) ||
        p.imei1?.toLowerCase().includes(query) ||
        p.imei2?.toLowerCase().includes(query) ||
        p.barcode?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      )
    );
  }, [productsData, searchQuery]);

  const availableTargetShops = useMemo(() => {
    return shops.filter(s => s.id !== sourceShopId);
  }, [shops, sourceShopId]);

  const sourceShopName = shops.find(s => s.id === sourceShopId)?.name || "";
  const targetShopName = shops.find(s => s.id === targetShopId)?.name || "";

  const stockTransferMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.stockTransfers.create>[0]) => api.stockTransfers.create(data),
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

    if (transferQty <= 0 || transferQty > selectedProduct.stock) {
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              {t("admin.products.inter_stock_transfer")}
            </DialogTitle>
            <DialogDescription>
              {t("admin.products.inter_store_movement")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t("admin.products.transfer_from_shop")}
                </Label>
                <Select value={sourceShopId} onValueChange={handleSourceShopChange}>
                  <SelectTrigger data-testid="select-source-shop">
                    <SelectValue placeholder={t("admin.products.select_shop")} />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t("admin.products.transfer_to_shop")}
                </Label>
                <Select value={targetShopId} onValueChange={setTargetShopId} disabled={!selectedProduct}>
                  <SelectTrigger data-testid="select-target-shop">
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t("admin.products.search_products")}
              </Label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.products.search_by_name_imei")}
                data-testid="input-search-products"
              />
            </div>

            <div className="flex-1 overflow-hidden">
              <Label className="mb-2 block">{t("admin.products.select_product")}</Label>
              <ScrollArea className="h-48 border rounded-md">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Package className="h-8 w-8 mb-2 opacity-50" />
                    <p>{t("admin.products.no_products_in_stock")}</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredProducts.map((product) => (
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
                              {product.customName || `Product ${product.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.imei1 && `IMEI: ${product.imei1}`}
                              {product.imei2 && ` / ${product.imei2}`}
                              {!product.imei1 && product.barcode && `Barcode: ${product.barcode}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={product.stock <= 5 ? "destructive" : "default"}>
                              {t("admin.products.stock")}: {product.stock}
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
              <Card className="p-4 bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{t("admin.products.selected_product")}</h4>
                    <p className="text-sm">{selectedProduct.customName || `Product ${selectedProduct.id.slice(0, 8)}`}</p>
                    {selectedProduct.imei1 && (
                      <p className="text-xs text-muted-foreground">IMEI1: {selectedProduct.imei1}</p>
                    )}
                    {selectedProduct.imei2 && (
                      <p className="text-xs text-muted-foreground">IMEI2: {selectedProduct.imei2}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("admin.products.available_stock")}: <span className="font-medium">{selectedProduct.stock}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="transfer-qty" className="whitespace-nowrap">{t("admin.products.quantity")}:</Label>
                    <Input
                      id="transfer-qty"
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={transferQty}
                      onChange={(e) => setTransferQty(Number(e.target.value))}
                      className="w-20"
                      data-testid="input-transfer-qty"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTransferQty(selectedProduct.stock)}
                      data-testid="button-send-all"
                    >
                      {t("admin.products.send_all")}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleInitiateTransfer}
              disabled={!selectedProduct || !targetShopId || stockTransferMutation.isPending}
              data-testid="button-submit-transfer"
            >
              {stockTransferMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              {t("admin.products.transfer_stock")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.products.confirm_transfer")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{t("admin.products.confirm_transfer_message")}</p>
              <div className="mt-4 p-3 bg-muted rounded-md space-y-1">
                <p><strong>{t("admin.products.product")}:</strong> {selectedProduct?.customName || `Product ${selectedProduct?.id.slice(0, 8)}`}</p>
                <p><strong>{t("admin.products.quantity")}:</strong> {transferQty}</p>
                <p className="flex items-center gap-2">
                  <strong>{sourceShopName}</strong>
                  <ArrowRight className="h-4 w-4" />
                  <strong>{targetShopName}</strong>
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmTransfer}
              data-testid="button-confirm-transfer"
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
