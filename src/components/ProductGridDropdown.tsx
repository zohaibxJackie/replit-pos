import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface MobileProduct {
  id: string;
  variantId: string;
  shopId: string;
  salePrice: string;
  stockStatus: "in_stock" | "out_of_stock" | "low_stock";
  condition: "new" | "used" | "refurbished";
  variantName: string;
  productName: string;
  categoryName: string;
  brandName: string;
  color: string;
  storageSize: string;
}

interface AccessoryProduct {
  stockId: string;
  variantId: string;
  variantName: string;
  productName: string;
  quantity: number;
  salePrice?: string;
  purchasePrice?: string;
  barcode?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";

  shopId: string;
  shopName: string;

  vendorId?: string;
  vendorName?: string;
}

interface ProductGridDropdownProps {
  category: "mobile" | "accessory";
  cart: MobileProduct[];
  onSelectProduct: (product: MobileProduct) => void;
  onClose: () => void;
}

export default function ProductGridDropdown({
  category,
  cart,
  onSelectProduct,
  onClose,
}: ProductGridDropdownProps) {
  const { toast } = useToast();

  const isInCart = (id: string) => cart.some((p) => p.id === id);

  // Mobiles
  const { data: mobilesData, isLoading: loadingMobiles } = useQuery({
    queryKey: ["/api/stock", { isActive: true }],
    queryFn: () => api.stock.getAll(),
    enabled: category === "mobile",
  });

  // Accessories
  const page = 1;
  const limit = 10;
  const shopId = localStorage.getItem("shopId");

  const { data: accessoriesData, isLoading: loadingAccessories } = useQuery({
    queryKey: ["accessories", shopId, page, limit],
    queryFn: () =>
      api.accessoryCatalog.getAll({
        page,
        limit,
        shopId: shopId!,
      }),
    enabled: category === "accessory" && !!shopId,
  });

  const products =
    category === "mobile"
      ? mobilesData?.stock || []
      : accessoriesData?.accessories || [];
  // Loading state
  if (
    (category === "mobile" && loadingMobiles) ||
    (category === "accessory" && loadingAccessories)
  ) {
    return <div className="text-center p-4">Loading products...</div>;
  }

  return (
    <div className="absolute inset-0 bg-background z-30 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button size="icon" variant="ghost" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="text-lg font-semibold capitalize">
          {category} Products
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product: MobileProduct | AccessoryProduct) => (
          <Card
            key={product.id}
            className="p-4 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <h3 className="font-medium text-sm">
                {"variantName" in product ? product.variantName : product.name}
              </h3>

              {"productName" in product && (
                <p className="text-xs text-muted-foreground">
                  {product.productName}
                </p>
              )}

              <p className="text-lg font-bold mt-1">
                ${"salePrice" in product ? product.salePrice : product.price}
              </p>

              <div className="mt-2">
                {product.stockStatus === "out_of_stock" ? (
                  <Badge variant="secondary">Out of stock</Badge>
                ) : product.stockStatus === "low_stock" ? (
                  <Badge variant="destructive">Low stock</Badge>
                ) : (
                  <Badge variant="success">In stock</Badge>
                )}
              </div>
            </div>

            <Button
              className="mt-3"
              disabled={
                ("stockStatus" in product &&
                  product.stockStatus !== "in_stock") ||
                isInCart(product.id)
              }
              onClick={() => {
                onSelectProduct(product as MobileProduct);
                toast({
                  title: "Added to cart",
                  description:
                    "variantName" in product
                      ? product.variantName
                      : product.name,
                });
              }}
            >
              {isInCart(product.id) ? "Added" : "Add to cart"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
