// ManageStock.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, Edit, Search as SearchIcon, Barcode } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/**
 * Product type same as your Products page
 */
interface Product {
  id: number;
  name: string;
  imeiOrSerial: string;
  stock: number;
  salePrice: number;
  store: string;
}

export default function ManageStock() {
  useAuth("catalogManageStock");
  const { setTitle } = useTitle();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [needHelp, setNeedHelp] = useState<boolean>(false)

  useEffect(() => {
    setTitle(t("admin.sub_pages.manage_stock.title"));
    return () => setTitle("Business Dashboard");
  }, [t, setTitle]);

  // mock product list (you can replace with API data)
  const [products, setProducts] = useState<Product[]>(
    Array.from({ length: 80 }, (_, i) => ({
      id: i + 1,
      name: "iPhone 12",
      imeiOrSerial: `SN1234${i}`,
      stock: i % 50,
      salePrice: 900 + i,
      store: "Main Store",
    }))
  );

  // reasons for dropdown
  const reasons = [
    { id: "new_purchase", name: "New Purchase", type: "add" },
    { id: "stock_correction", name: "Stock Correction", type: "add" },
    { id: "customer_return", name: "Customer Return", type: "return" },
    { id: "supplier_return", name: "Supplier Return", type: "return" },
    { id: "product_expired", name: "Product Expired", type: "wastage" },
    { id: "damaged_product", name: "Damaged Product", type: "wastage" },
  ];

  // search states
  const [search, setSearch] = useState<string>("");
  const [scanResult, setScanResult] = useState<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const readerContainerRef = useRef<HTMLDivElement | null>(null);
  const [scannerActive, setScannerActive] = useState<boolean>(false);

  // UI state for stock change form per selected row
  const [qtyByProduct, setQtyByProduct] = useState<Record<number, number>>({});
  const [reasonByProduct, setReasonByProduct] = useState<Record<number, string>>({});
  const [actionType, setActionType] = useState<"add" | "return" | "wastage">("add");

  // start camera scanner
  const startCameraScanner = () => {
    if (scannerActive) return;
    try {
      const config = { fps: 10, qrbox: 250 };
      const scanner = new Html5QrcodeScanner(
        readerContainerRef.current ? readerContainerRef.current.id : "reader",
        config,
        false
      );
      scanner.render(
        (decodedText) => {
          setScanResult(decodedText || "");
          setSearch(decodedText || "");
        },
        () => {
          // ignore scan errors silently
        }
      );
      scannerRef.current = scanner;
      setScannerActive(true);
    } catch (err) {
      console.error("Scanner start failed", err);
    }
  };

  // stop camera scanner
  const stopCameraScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.error("Failed to stop scanner", err);
    } finally {
      setScannerActive(false);
      if (readerContainerRef.current) {
        readerContainerRef.current.innerHTML = "";
      }
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      performSearch((e.target as HTMLInputElement).value || search);
    }
  };

  const performSearch = (term: string) => {
    const q = (term || "").trim();
    setSearch(q);
  };

  const filteredProducts = useMemo(() => {
    const term = (search || scanResult || "").trim().toLowerCase();
    if (!term) return [];
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.imeiOrSerial.toLowerCase().includes(term)
      );
    });
  }, [products, search, scanResult]);

  const handleQtyChange = (productId: number, value: number) => {
    setQtyByProduct((prev) => ({ ...prev, [productId]: value }));
  };

  const handleReasonSelect = (productId: number, value: string) => {
    setReasonByProduct((prev) => ({ ...prev, [productId]: value }));
  };

  const submitStockChange = (product: Product) => {
    const qty = Number(qtyByProduct[product.id] || 0);
    const reason = (reasonByProduct[product.id] || "").trim();

    if (!qty || qty <= 0) {
      toast({ title: "Invalid quantity", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }
    if (!reason) {
      toast({ title: "Missing reason", description: "Please select a reason.", variant: "destructive" });
      return;
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== product.id) return p;
        if (actionType === "add") return { ...p, stock: p.stock + qty };
        return { ...p, stock: Math.max(0, p.stock - qty) };
      })
    );

    const title =
      actionType === "add"
        ? "Stock Added"
        : actionType === "return"
        ? "Stock Returned"
        : "Marked as Wastage";

    toast({
      title,
      description: `${qty} unit(s) ${actionType === "add" ? "added to" : "removed from"} ${product.name}`,
    });

    setQtyByProduct((prev) => ({ ...prev, [product.id]: 0 }));
    setReasonByProduct((prev) => ({ ...prev, [product.id]: "" }));
  };

  const currentReasons = reasons.filter((r) => r.type === actionType);

  return (
    <div className="space-y-6">
      {/* Header / Actions */}
      <div className="flex items-center justify-end">

        <div className="flex gap-2 items-center">
          <div className="flex rounded bg-muted p-1">
            <button
              className={`px-3 py-1 rounded text-sm ${actionType === "add" ? "bg-white shadow" : ""}`}
              onClick={() => setActionType("add")}
              title="Add stock"
            >
              <Plus className="inline-block w-4 h-4 mr-1" /> Add
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${actionType === "return" ? "bg-white shadow" : ""}`}
              onClick={() => setActionType("return")}
              title="Return stock"
            >
              <Minus className="inline-block w-4 h-4 mr-1" /> Return
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${actionType === "wastage" ? "bg-white shadow text-red-600" : ""}`}
              onClick={() => setActionType("wastage")}
              title="Move to wastage"
            >
              <Trash2 className="inline-block w-4 h-4 mr-1" /> Wastage
            </button>
          </div>
        </div>
      </div>

      {/* Search + Scanner Controls */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Type product name or IMEI or scan with camera"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              data-testid="manage-stock-search-input"
            />

            <Button
              variant={scannerActive ? "destructive" : "default"}
              onClick={() => (scannerActive ? stopCameraScanner() : startCameraScanner())}
              title={scannerActive ? "Stop Camera" : "Start Camera Scanner"}
            >
              <Barcode className="w-4 h-4" />
              <span className="ml-2 text-sm">{scannerActive ? "Stop" : "Scan"}</span>
            </Button>
          </div>

          {/* camera scanner container (Html5QrcodeScanner will render here) */}
          <div className="mt-2" ref={readerContainerRef} id="reader" style={{ width: "320px" }} />

          <div className="flex justify-end">
            <p className="text-xs text-blue-500 cursor-pointer hover:underline" onClick={() => {setNeedHelp(!needHelp)}}>Need help?</p>
          </div>

          {needHelp || <div>
            <p className="text-sm text-muted-foreground mt-2">We can scan with camera or use a hardware barcode scanner that types into this input and sends Enter.</p>
            <p className="text-sm text-muted-foreground mt-2">To use a scanner, please click in the input field before scanning.</p>
          </div>}

        </div>
      </div>

      {/* Table showing results (only when searched) */}
      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 w-12">#</th>
              <th className="p-3">Product Name</th>
              <th className="p-3">IMEI/Serial</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Sale Price</th>
              <th className="p-3 flex justify-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              (search.trim() === "" && scanResult.trim() === "") ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                    Type a product name or IMEI/Serial above, or use Scan to find a product.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                    No products found for "{search || scanResult}"
                  </td>
                </tr>
              )
            ) : (
              filteredProducts.map((p, idx) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 align-top">{idx + 1}</td>
                  <td className="p-3 align-top">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.store}</div>
                  </td>
                  <td className="p-3 align-top">{p.imeiOrSerial}</td>
                  <td className="p-3 align-top">
                    <Badge variant={p.stock <= 0 ? "destructive" : "default"}>{p.stock}</Badge>
                  </td>
                  <td className="p-3 align-top">${p.salePrice}</td>

                  {/* Actions + inline stock form */}
                  <td className="p-3 align-top">
                    <div className="flex items-start gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={qtyByProduct[p.id] ?? ""}
                          onChange={(e) => handleQtyChange(p.id, Number(e.target.value))}
                          className="w-20 text-sm"
                        />

                        {/* Reason dropdown */}
                        <Select
                          value={reasonByProduct[p.id] ?? ""}
                          onValueChange={(val) => handleReasonSelect(p.id, val)}
                        >
                          <SelectTrigger className="w-52 text-sm">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentReasons.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          size="sm"
                          onClick={() => submitStockChange(p)}
                          variant={actionType === "wastage" ? "destructive" : "default"}
                        >
                          {actionType === "add" ? "Add" : actionType === "return" ? "Return" : "Move"}
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
