import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, XCircle, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";

interface Product {
  id: string;
  name: string;
  barcode?: string;
  price: string;
  stock: number;
  lowStockThreshold: number;
}

interface ProductSearchProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  autoFocus?: boolean;
  handleScanning: () => void;
  search: string;
  result: string;
  setSearch: (value: string) => void;
  setResult: (value: string) => void;
  onKeyDown: () => void;
}

export default function ProductSearch({
  products,
  onSelectProduct,
  autoFocus = false,
  handleScanning,
  search,
  setSearch,
  result,
  setResult,
}: ProductSearchProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (search.trim()) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.barcode?.includes(search)
      );
      setFilteredProducts(filtered);
      setShowResults(true);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  }, [search, products]);

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setSearch("");
    setShowResults(false);
  };
  const clearInputField = () => {
    setSearch("");
    setResult("");
  };

  return (
    <div className="relative">
      <div className="relative w-full">
        {/* Search icon on left */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

        {/* Input with extra padding on right for button */}
        <Input
          type="text"
          placeholder="Search by name or scan barcode..."
          value={search || result}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-24" // space for camera button
          autoFocus={autoFocus}
          data-testid="input-product-search"
        />

        {/* Camera button inside input on right */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <Button
            variant="default"
            size="sm"
            onClick={handleScanning}
            className="flex items-center h-8"
          >
            <Camera className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Scan</span>
          </Button>
        </div>

        {/* Clear X button */}
        {(search !== "" || result !== "") && (
          <XCircle
            onClick={clearInputField}
            className="absolute right-24 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer"
          />
        )}
      </div>

      {showResults && filteredProducts.length > 0 && (
        <Card className="absolute z-10 w-full mt-2 max-h-80 overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="w-full p-3 text-left hover-elevate active-elevate-2 flex items-center justify-between border-b last:border-b-0"
              data-testid={`button-select-product-${product.id}`}
            >
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {product.barcode && `Barcode: ${product.barcode}`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${product.price}</div>
                {product.stock < product.lowStockThreshold && (
                  <Badge variant="destructive" className="text-xs">
                    Low Stock
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
