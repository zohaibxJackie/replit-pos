import { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Camera, Scan } from "lucide-react";
import { BarcodeScannerDialog } from "@/components/BarcodeScannerDialog";

// Mock brand data
const mockBrands = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "oppo", name: "OPPO" },
  { id: "vivo", name: "Vivo" },
  { id: "realme", name: "Realme" },
  { id: "oneplus", name: "OnePlus" },
  { id: "huawei", name: "Huawei" },
  { id: "google", name: "Google" },
  { id: "sony", name: "Sony" },
];

// Mock phone models by brand
const mockPhoneModels: Record<string, string[]> = {
  apple: [
    "iPhone 15 Pro Max 256GB",
    "iPhone 15 Pro Max 512GB",
    "iPhone 15 Pro 128GB",
    "iPhone 15 Pro 256GB",
    "iPhone 15 Plus 128GB",
    "iPhone 15 128GB",
    "iPhone 14 Pro Max 256GB",
    "iPhone 14 Pro 256GB",
    "iPhone 14 Plus 128GB",
    "iPhone 14 128GB",
    "iPhone 13 Pro Max 256GB",
    "iPhone 13 Pro 128GB",
    "iPhone 13 128GB",
    "iPhone 12 Pro Max 256GB",
    "iPhone 12 Pro 128GB",
    "iPhone 12 128GB",
    "iPhone 11 64GB",
    "iPhone 11 128GB",
  ],
  samsung: [
    "Galaxy S24 Ultra 256GB",
    "Galaxy S24 Ultra 512GB",
    "Galaxy S24 Plus 256GB",
    "Galaxy S24 128GB",
    "Galaxy S23 Ultra 256GB",
    "Galaxy S23 Plus 256GB",
    "Galaxy S23 128GB",
    "Galaxy S22 Ultra 256GB",
    "Galaxy Z Fold 5 256GB",
    "Galaxy Z Flip 5 256GB",
    "Galaxy A54 128GB",
    "Galaxy A34 128GB",
  ],
  xiaomi: [
    "Xiaomi 14 Pro 512GB",
    "Xiaomi 14 256GB",
    "Xiaomi 13 Pro 256GB",
    "Xiaomi 13 128GB",
    "Redmi Note 13 Pro 256GB",
    "Redmi Note 13 128GB",
    "Redmi Note 12 Pro 256GB",
    "POCO X6 Pro 256GB",
    "POCO F5 256GB",
  ],
  oppo: [
    "Find X6 Pro 256GB",
    "Find X5 Pro 256GB",
    "Reno 11 Pro 256GB",
    "Reno 10 Pro 256GB",
    "A78 128GB",
    "A58 128GB",
  ],
  vivo: [
    "X100 Pro 256GB",
    "X90 Pro 256GB",
    "V29 Pro 256GB",
    "V27 Pro 256GB",
    "Y100 128GB",
  ],
  realme: [
    "GT 5 Pro 256GB",
    "GT Neo 6 256GB",
    "11 Pro Plus 256GB",
    "11 Pro 128GB",
    "C67 128GB",
  ],
  oneplus: [
    "OnePlus 12 256GB",
    "OnePlus 11 256GB",
    "OnePlus Nord 3 256GB",
    "OnePlus Nord CE 3 128GB",
  ],
  huawei: [
    "Mate 60 Pro 512GB",
    "P60 Pro 256GB",
    "Nova 12 Pro 256GB",
  ],
  google: [
    "Pixel 8 Pro 256GB",
    "Pixel 8 128GB",
    "Pixel 7 Pro 256GB",
    "Pixel 7 128GB",
  ],
  sony: [
    "Xperia 1 V 256GB",
    "Xperia 5 V 128GB",
  ],
};

// Mock tax data
const mockTaxes = [
  { id: "no_tax", name: "No Tax", value: 0 },
  { id: "tax5", name: "5% Tax", value: 5 },
  { id: "tax10", name: "10% Tax", value: 10 },
  { id: "tax15", name: "15% Tax", value: 15 },
  { id: "tax18", name: "18% Tax", value: 18 },
];

// Searchable Select Component
function SearchableSelect({
  items,
  placeholder,
  value,
  onChange,
  labelKey = "name",
}: {
  items: { id: string; [k: string]: any }[];
  placeholder?: string;
  value?: string;
  onChange: (v: string) => void;
  labelKey?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      items.filter((it) =>
        String(it[labelKey] ?? "")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query, labelKey]
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder={`Search ${placeholder ?? ""}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-48 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No results found
            </div>
          ) : (
            filtered.map((it) => (
              <SelectItem key={it.id} value={it.id}>
                {it[labelKey]}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

// Phone Model Autocomplete Component
function PhoneModelAutocomplete({
  brandId,
  value,
  onChange,
}: {
  brandId?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Sync inputValue with parent value and brandId changes
  useEffect(() => {
    setInputValue(value);
  }, [value, brandId]);

  const models = useMemo(() => {
    if (!brandId) return [];
    return mockPhoneModels[brandId] || [];
  }, [brandId]);

  const filteredModels = useMemo(() => {
    if (!inputValue.trim()) return models;
    return models.filter((model) =>
      model.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [models, inputValue]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val);
    setShowSuggestions(val.length > 0 && filteredModels.length > 0);
  };

  const handleSelectModel = (model: string) => {
    setInputValue(model);
    onChange(model);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() =>
          setShowSuggestions(inputValue.length > 0 && filteredModels.length > 0)
        }
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={brandId ? "Start typing phone model..." : "Select brand first"}
        disabled={!brandId}
        data-testid="input-phone-model"
      />
      {showSuggestions && filteredModels.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-64 overflow-auto">
          {filteredModels.map((model, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover-elevate active-elevate-2"
              onClick={() => handleSelectModel(model)}
              data-testid={`suggestion-model-${idx}`}
            >
              {model}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export interface MobileProductPayload {
  brand: string;
  model: string;
  color: string;
  imei: string;
  imei2?: string;
  purchasePrice: number;
  sellingPrice: number;
  taxId?: string;
  category: string; // Always "mobile"
}

interface MobileProductFormProps {
  onSubmit: (payload: MobileProductPayload) => void;
  onCancel: () => void;
}

export function MobileProductForm({ onSubmit, onCancel }: MobileProductFormProps) {
  // Form state
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [imei, setImei] = useState<string>("");
  const [imei2, setImei2] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [taxId, setTaxId] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [showScanner2, setShowScanner2] = useState(false);

  // Handle brand change - reset model when brand changes
  const handleBrandChange = useCallback((newBrand: string) => {
    setBrand(newBrand);
    setModel(""); // Clear model when brand changes
  }, []);

  // Calculate final price with tax
  const finalPrice = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0;
    if (!taxId) return price;

    const tax = mockTaxes.find((t) => t.id === taxId);
    if (!tax || tax.value === 0) return price;

    return price + (price * tax.value) / 100;
  }, [sellingPrice, taxId]);

  const handleIMEIScan = useCallback((scannedCode: string) => {
    setImei(scannedCode);
    setShowScanner(false);
  }, []);

  const handleIMEI2Scan = useCallback((scannedCode: string) => {
    setImei2(scannedCode);
    setShowScanner2(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!brand) newErrors.brand = "Brand is required";
    if (!model.trim()) {
      newErrors.model = "Phone model is required";
    } else if (brand) {
      // Validate that model belongs to selected brand
      const brandModels = mockPhoneModels[brand] || [];
      if (brandModels.length > 0 && !brandModels.includes(model.trim())) {
        newErrors.model = "Please select a valid model for the selected brand";
      }
    }
    if (!color.trim()) newErrors.color = "Color is required";
    if (!imei.trim()) newErrors.imei = "IMEI is required";
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      newErrors.purchasePrice = "Valid purchase price is required";
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      newErrors.sellingPrice = "Valid selling price is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Get brand display name
    const brandName = mockBrands.find(b => b.id === brand)?.name || brand;

    // Prepare payload
    const payload: MobileProductPayload = {
      brand: brandName, // Use display name instead of ID
      model: model.trim(),
      color: color.trim(),
      imei: imei.trim(),
      imei2: imei2.trim() || undefined,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      taxId,
      category: "mobile", // Default category
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand Selection */}
      <div>
        <Label htmlFor="brand" className="text-sm font-medium">
          Brand <span className="text-destructive">*</span>
        </Label>
        <SearchableSelect
          items={mockBrands}
          placeholder="Select brand"
          value={brand}
          onChange={handleBrandChange}
        />
        {errors.brand && (
          <p className="text-destructive text-xs mt-1">{errors.brand}</p>
        )}
      </div>

      {/* Phone Model */}
      <div>
        <Label htmlFor="model" className="text-sm font-medium">
          Phone Model <span className="text-destructive">*</span>
        </Label>
        <PhoneModelAutocomplete
          brandId={brand}
          value={model}
          onChange={setModel}
        />
        {errors.model && (
          <p className="text-destructive text-xs mt-1">{errors.model}</p>
        )}
      </div>

      {/* Color */}
      <div>
        <Label htmlFor="color" className="text-sm font-medium">
          Color <span className="text-destructive">*</span>
        </Label>
        <Input
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="e.g., Black, White, Blue"
          data-testid="input-color"
        />
        {errors.color && (
          <p className="text-destructive text-xs mt-1">{errors.color}</p>
        )}
      </div>

      {/* IMEI */}
      <div>
        <Label htmlFor="imei" className="text-sm font-medium">
          IMEI <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="imei"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="Enter or scan IMEI"
            className="flex-1"
            data-testid="input-imei"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowScanner(true)}
            data-testid="button-scan-imei"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        {errors.imei && (
          <p className="text-destructive text-xs mt-1">{errors.imei}</p>
        )}
      </div>

      {/* IMEI 2 (Optional) */}
      <div>
        <Label htmlFor="imei2" className="text-sm font-medium">
          IMEI 2 <span className="text-muted-foreground text-xs">(Optional)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="imei2"
            value={imei2}
            onChange={(e) => setImei2(e.target.value)}
            placeholder="Enter or scan IMEI 2"
            className="flex-1"
            data-testid="input-imei2"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowScanner2(true)}
            data-testid="button-scan-imei2"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Purchase Price */}
      <div>
        <Label htmlFor="purchasePrice" className="text-sm font-medium">
          Purchase Price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder="Enter purchase price"
          data-testid="input-purchase-price"
        />
        {errors.purchasePrice && (
          <p className="text-destructive text-xs mt-1">{errors.purchasePrice}</p>
        )}
      </div>

      {/* Selling Price */}
      <div>
        <Label htmlFor="sellingPrice" className="text-sm font-medium">
          Selling Price <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sellingPrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          placeholder="Enter selling price"
          data-testid="input-selling-price"
        />
        {errors.sellingPrice && (
          <p className="text-destructive text-xs mt-1">{errors.sellingPrice}</p>
        )}
      </div>

      {/* Tax */}
      <div>
        <Label htmlFor="tax" className="text-sm font-medium">
          Tax
        </Label>
        <SearchableSelect
          items={mockTaxes}
          placeholder="Select tax (optional)"
          value={taxId}
          onChange={setTaxId}
        />
      </div>

      {/* Final Price Display */}
      {sellingPrice && parseFloat(sellingPrice) > 0 && (
        <div className="p-3 bg-muted rounded-md">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Final Price (with tax):</span>
            <span className="font-semibold text-lg">
              PKR {finalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
        <Button type="submit" data-testid="button-submit-mobile">
          Add Mobile
        </Button>
      </div>

      {/* IMEI Scanner Dialog */}
      <BarcodeScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanSuccess={handleIMEIScan}
      />

      {/* IMEI 2 Scanner Dialog */}
      <BarcodeScannerDialog
        open={showScanner2}
        onOpenChange={setShowScanner2}
        onScanSuccess={handleIMEI2Scan}
      />
    </form>
  );
}
