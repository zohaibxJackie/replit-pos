import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { Camera, Loader2 } from "lucide-react";
import { BarcodeScannerDialog } from "@/components/BarcodeScannerDialog";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface Tax {
  id: string;
  name: string;
  type: 'percent' | 'flat';
  value: string;
  isActive: boolean;
}

interface MobileModel {
  id: string;
  name: string;
  memory?: string;
  displayName: string;
  productId: string;
}

interface MobileColor {
  id: string;
  color: string;
}

function SearchableSelect({
  items,
  placeholder,
  value,
  onChange,
  labelKey = "name",
  isLoading = false,
  disabled = false,
}: {
  items: { id: string; [k: string]: any }[];
  placeholder?: string;
  value?: string;
  onChange: (v: string) => void;
  labelKey?: string;
  isLoading?: boolean;
  disabled?: boolean;
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
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
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

function PhoneModelAutocomplete({
  models,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  models: MobileModel[];
  value: string;
  onChange: (model: MobileModel | null, displayValue: string) => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredModels = useMemo(() => {
    if (!inputValue.trim()) return models;
    return models.filter((model) =>
      model.displayName.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [models, inputValue]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(null, val);
    setShowSuggestions(val.length > 0 && filteredModels.length > 0);
  };

  const handleSelectModel = (model: MobileModel) => {
    setInputValue(model.displayName);
    onChange(model, model.displayName);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() =>
            setShowSuggestions(filteredModels.length > 0)
          }
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={disabled ? "Select brand first" : "Start typing phone model..."}
          disabled={disabled}
          data-testid="input-phone-model"
        />
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </div>
      {showSuggestions && filteredModels.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-64 overflow-auto">
          {filteredModels.map((model, idx) => (
            <button
              key={model.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover-elevate active-elevate-2"
              onClick={() => handleSelectModel(model)}
              data-testid={`suggestion-model-${idx}`}
            >
              {model.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorAutocomplete({
  colors,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  colors: MobileColor[];
  value: string;
  onChange: (color: MobileColor | null, displayValue: string) => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredColors = useMemo(() => {
    if (!inputValue.trim()) return colors;
    return colors.filter((c) =>
      c.color.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [colors, inputValue]);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(null, val);
    setShowSuggestions(val.length > 0 && filteredColors.length > 0);
  };

  const handleSelectColor = (color: MobileColor) => {
    setInputValue(color.color);
    onChange(color, color.color);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(filteredColors.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={disabled ? "Select model first" : "e.g., Black, White, Blue"}
          disabled={disabled}
          data-testid="input-color"
        />
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </div>
      {showSuggestions && filteredColors.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-64 overflow-auto">
          {filteredColors.map((color, idx) => (
            <button
              key={color.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover-elevate active-elevate-2"
              onClick={() => handleSelectColor(color)}
              data-testid={`suggestion-color-${idx}`}
            >
              {color.color}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export interface ImeiEntry {
  imei1: string;
  imei2: string;
}

export interface MobileProductPayload {
  brand: string;
  model: string;
  memory?: string;
  color: string;
  imei: string;
  imei2?: string;
  purchasePrice: number;
  sellingPrice: number;
  taxId?: string;
  mobileCatalogId?: string;
  category: string;
  quantity?: number;
  imeis?: ImeiEntry[];
  variantId: string;
}

interface MobileProductFormProps {
  onSubmit: (payload: MobileProductPayload) => void;
  onCancel: () => void;
  initialData?: Partial<MobileProductPayload>;
  shopId?: string;
  isEditing?: boolean;
}

export function MobileProductForm({ onSubmit, onCancel, initialData, shopId, isEditing = false }: MobileProductFormProps) {
  const { t } = useTranslation();

  const [brand, setBrand] = useState<string>(initialData?.brand || "");
  const [selectedModel, setSelectedModel] = useState<MobileModel | null>(null);
  const [modelDisplay, setModelDisplay] = useState<string>(initialData?.model || "");
  const [selectedColor, setSelectedColor] = useState<MobileColor | null>(null);
  const [colorDisplay, setColorDisplay] = useState<string>(initialData?.color || "");
  const [imei, setImei] = useState<string>(initialData?.imei || "");
  const [imei2, setImei2] = useState<string>(initialData?.imei2 || "");
  const [purchasePrice, setPurchasePrice] = useState<string>(initialData?.purchasePrice?.toString() || "");
  const [sellingPrice, setSellingPrice] = useState<string>(initialData?.sellingPrice?.toString() || "");
  const [taxId, setTaxId] = useState<string | undefined>(initialData?.taxId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [imeis, setImeis] = useState<ImeiEntry[]>([{ imei1: "", imei2: "" }]);
  const [showScanner, setShowScanner] = useState(false);
  const [showScanner2, setShowScanner2] = useState(false);
  const [showBulkScanner, setShowBulkScanner] = useState(false);
  const [activeScannerIndex, setActiveScannerIndex] = useState<number | null>(null);
  const [activeScannerField, setActiveScannerField] = useState<'imei1' | 'imei2'>('imei1');

  const handleQuantityChange = useCallback((newQty: number) => {
    const qty = Math.max(1, Math.min(100, newQty));
    setQuantity(qty);
    setImeis(prevImeis => {
      if (qty > prevImeis.length) {
        return [...prevImeis, ...Array(qty - prevImeis.length).fill(null).map(() => ({ imei1: "", imei2: "" }))];
      } else {
        return prevImeis.slice(0, qty);
      }
    });
  }, []);

  const updateImei = useCallback((index: number, field: 'imei1' | 'imei2', value: string) => {
    setImeis(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  }, []);

  const handleBulkImeiScan = useCallback((scannedCode: string) => {
    if (activeScannerIndex !== null) {
      updateImei(activeScannerIndex, activeScannerField, scannedCode);
    }
    setShowBulkScanner(false);
    setActiveScannerIndex(null);
  }, [activeScannerIndex, activeScannerField, updateImei]);

  const openBulkScanner = useCallback((index: number, field: 'imei1' | 'imei2') => {
    setActiveScannerIndex(index);
    setActiveScannerField(field);
    setShowBulkScanner(true);
  }, []);

  const { data: brandsData, isLoading: brandsLoading } = useQuery<{ brands: Array<{ id: string; name: string }> }>({
    queryKey: ['/api/products/brands'],
  });

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/products/catalog/mobiles/models', brand],
    queryFn: () => api.mobileCatalog.getModels(brand),
    enabled: !!brand,
  });

  const { data: colorsData, isLoading: colorsLoading } = useQuery({
    queryKey: ['/api/products/catalog/mobiles/colors', brand, selectedModel?.name, selectedModel?.memory],
    queryFn: () => api.mobileCatalog.getColors(selectedModel),
    enabled: !!brand && !!selectedModel,
  });

  const { data: taxesData, isLoading: taxesLoading } = useQuery({
    queryKey: ['/api/taxes', { isActive: true }],
    queryFn: () => api.taxes.getAll({ isActive: true }),
  });

  const brands = useMemo(() => {
    return brandsData?.brands?.map(b => ({ id: b.id, name: b.name })) || [];
  }, [brandsData]);

  const models = useMemo(() => {
    return modelsData?.models || [];
  }, [modelsData]);

  const colors = useMemo(() => {
    return colorsData?.colors || [];
  }, [colorsData]);

  const taxes = useMemo(() => {
    const taxList = taxesData?.taxes || [];
    return [
      { id: "no_tax", name: t("products.no_tax"), type: 'percent' as const, value: "0", isActive: true },
      ...taxList.map(t => ({
        id: t.id,
        name: `${t.name} (${t.type === 'percent' ? t.value + '%' : t.value})`,
        type: t.type,
        value: t.value,
        isActive: t.isActive
      }))
    ];
  }, [taxesData, t]);

  const handleBrandChange = useCallback((newBrand: string) => {
    setBrand(newBrand);
    setSelectedModel(null);
    setModelDisplay("");
    setSelectedColor(null);
    setColorDisplay("");
  }, []);

  const handleModelChange = useCallback((model: MobileModel | null, displayValue: string) => {
    setSelectedModel(model);
    setModelDisplay(displayValue);
    if (model) {
      setSelectedColor(null);
      setColorDisplay("");
    }
  }, []);

  const handleColorChange = useCallback((color: MobileColor | null, displayValue: string) => {
    setSelectedColor(color);
    setColorDisplay(displayValue);
  }, []);

  const finalPrice = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0;
    if (!taxId || taxId === "no_tax") return price;

    const tax = taxes.find((t) => t.id === taxId);
    if (!tax || parseFloat(tax.value) === 0) return price;

    if (tax.type === 'percent') {
      return price + (price * parseFloat(tax.value)) / 100;
    } else {
      return price + parseFloat(tax.value);
    }
  }, [sellingPrice, taxId, taxes]);

  const handleIMEIScan = useCallback((scannedCode: string) => {
    if (isEditing || quantity === 1) {
      setImei(scannedCode);
    }
    setShowScanner(false);
  }, [isEditing, quantity]);

  const handleIMEI2Scan = useCallback((scannedCode: string) => {
    if (isEditing || quantity === 1) {
      setImei2(scannedCode);
    }
    setShowScanner2(false);
  }, [isEditing, quantity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!brand) newErrors.brand = t("products.form.brand_required");
    if (!selectedModel) {
      newErrors.model = t("products.form.select_model_from_list");
    }
    if (colors.length > 0 && !selectedColor) {
      newErrors.color = t("products.form.select_color_from_list");
    } else if (colors.length === 0 && selectedModel && !colorDisplay.trim()) {
      newErrors.color = t("products.form.color_required");
    }
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      newErrors.purchasePrice = t("products.form.purchase_price_required");
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      newErrors.sellingPrice = t("products.form.selling_price_required");
    }

    if (isEditing || quantity === 1) {
      if (!imei.trim()) newErrors.imei = t("products.form.imei_required");
    } else {
      if (imeis.length !== quantity) {
        newErrors.quantity = t("products.form.imei_count_mismatch");
      }
      imeis.forEach((entry, index) => {
        if (!entry.imei1.trim()) {
          newErrors[`imei_${index}`] = t("products.form.imei_required_for_phone", { number: index + 1 });
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!selectedModel) {
      return;
    }

    const payload: MobileProductPayload = {
      brand,
      model: selectedModel.name,
      memory: selectedModel.memory,
      color: selectedColor?.color || colorDisplay.trim(),
      imei: isEditing || quantity === 1 ? imei.trim() : imeis[0]?.imei1.trim() || "",
      imei2: isEditing || quantity === 1 ? (imei2.trim() || undefined) : (imeis[0]?.imei2.trim() || undefined),
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      taxId: taxId === "no_tax" ? undefined : taxId,
      mobileCatalogId: selectedColor?.id || selectedModel.id,
      category: "mobile",
      quantity: !isEditing && quantity > 1 ? quantity : undefined,
      imeis: !isEditing && quantity > 1 ? imeis : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="brand" className="text-sm font-medium">
          {t("products.form.brand")} <span className="text-destructive">*</span>
        </Label>
        <SearchableSelect
          items={brands}
          placeholder={t("products.form.select_brand")}
          value={brand}
          onChange={handleBrandChange}
          isLoading={brandsLoading}
        />
        {errors.brand && (
          <p className="text-destructive text-xs mt-1">{errors.brand}</p>
        )}
      </div>

      <div>
        <Label htmlFor="model" className="text-sm font-medium">
          {t("products.form.phone_model")} <span className="text-destructive">*</span>
        </Label>
        <PhoneModelAutocomplete
          models={models}
          value={modelDisplay}
          onChange={handleModelChange}
          isLoading={modelsLoading}
          disabled={!brand}
        />
        {errors.model && (
          <p className="text-destructive text-xs mt-1">{errors.model}</p>
        )}
      </div>

      <div>
        <Label htmlFor="color" className="text-sm font-medium">
          {t("products.form.color")} <span className="text-destructive">*</span>
        </Label>
        <ColorAutocomplete
          colors={colors}
          value={colorDisplay}
          onChange={handleColorChange}
          isLoading={colorsLoading}
          disabled={!selectedModel}
        />
        {errors.color && (
          <p className="text-destructive text-xs mt-1">{errors.color}</p>
        )}
      </div>

      {!isEditing && (
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium">
            {t("products.form.quantity")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            placeholder={t("products.form.enter_quantity")}
            data-testid="input-quantity"
          />
          <p className="text-muted-foreground text-xs mt-1">
            {t("products.form.quantity_hint")}
          </p>
        </div>
      )}

      {(isEditing || quantity === 1) ? (
        <>
          <div>
            <Label htmlFor="imei" className="text-sm font-medium">
              {t("products.form.imei")} <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="imei"
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                placeholder={t("products.form.enter_or_scan_imei")}
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

          <div>
            <Label htmlFor="imei2" className="text-sm font-medium">
              {t("products.form.imei2")} <span className="text-muted-foreground text-xs">({t("products.form.optional")})</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="imei2"
                value={imei2}
                onChange={(e) => setImei2(e.target.value)}
                placeholder={t("products.form.enter_or_scan_imei2")}
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
        </>
      ) : (
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            {t("products.form.imei_entries")} <span className="text-destructive">*</span>
          </Label>
          <div className="max-h-64 overflow-y-auto space-y-3 border rounded-md p-3">
            {imeis.map((entry, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-md space-y-2">
                <div className="font-medium text-sm text-muted-foreground">
                  {t("products.form.phone_number", { number: index + 1 })}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs">{t("products.form.imei")} 1 *</Label>
                    <div className="flex gap-1">
                      <Input
                        value={entry.imei1}
                        onChange={(e) => updateImei(index, 'imei1', e.target.value)}
                        placeholder={t("products.form.imei")}
                        className="flex-1"
                        data-testid={`input-imei1-${index}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openBulkScanner(index, 'imei1')}
                        data-testid={`button-scan-imei1-${index}`}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    {errors[`imei_${index}`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`imei_${index}`]}</p>
                    )}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs">{t("products.form.imei")} 2</Label>
                    <div className="flex gap-1">
                      <Input
                        value={entry.imei2}
                        onChange={(e) => updateImei(index, 'imei2', e.target.value)}
                        placeholder={t("products.form.optional")}
                        className="flex-1"
                        data-testid={`input-imei2-${index}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openBulkScanner(index, 'imei2')}
                        data-testid={`button-scan-imei2-${index}`}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="purchasePrice" className="text-sm font-medium">
          {t("products.form.purchase_price")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder={t("products.form.enter_purchase_price")}
          data-testid="input-purchase-price"
        />
        {errors.purchasePrice && (
          <p className="text-destructive text-xs mt-1">{errors.purchasePrice}</p>
        )}
      </div>

      <div>
        <Label htmlFor="sellingPrice" className="text-sm font-medium">
          {t("products.form.selling_price")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sellingPrice"
          type="number"
          inputMode="decimal"
          step="0.01"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          placeholder={t("products.form.enter_selling_price")}
          data-testid="input-selling-price"
        />
        {errors.sellingPrice && (
          <p className="text-destructive text-xs mt-1">{errors.sellingPrice}</p>
        )}
      </div>

      <div>
        <Label htmlFor="tax" className="text-sm font-medium">
          {t("products.form.tax")}
        </Label>
        <SearchableSelect
          items={taxes}
          placeholder={t("products.form.select_tax")}
          value={taxId}
          onChange={setTaxId}
          isLoading={taxesLoading}
        />
      </div>

      {sellingPrice && parseFloat(sellingPrice) > 0 && (
        <div className="p-3 bg-muted rounded-md">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{t("products.form.final_price_with_tax")}:</span>
            <span className="font-semibold text-lg">
              PKR {finalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-testid="button-cancel"
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" data-testid="button-submit-mobile">
          {initialData ? t("products.form.update_mobile") : t("products.form.add_mobile")}
        </Button>
      </div>

      <BarcodeScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanSuccess={handleIMEIScan}
      />

      <BarcodeScannerDialog
        open={showScanner2}
        onOpenChange={setShowScanner2}
        onScanSuccess={handleIMEI2Scan}
      />

      <BarcodeScannerDialog
        open={showBulkScanner}
        onOpenChange={(open) => {
          setShowBulkScanner(open);
          if (!open) setActiveScannerIndex(null);
        }}
        onScanSuccess={handleBulkImeiScan}
      />
    </form>
  );
}
