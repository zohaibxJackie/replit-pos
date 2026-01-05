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
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Textarea } from "./ui/textarea";
import { useAuthStore } from "@/store/authStore";

type TaxType = "flat" | "percent";
interface Tax {
  id: string;
  name: string;
  type: TaxType;
  value: string;
  isActive: boolean;
}

interface AcessoryModel {
  id: string;
  name: string;
  memory?: string;
  displayName: string;
  productId: string;
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

function AccessoryModelAutocomplete({
  models,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  models: AcessoryModel[];
  value: string;
  onChange: (model: AcessoryModel | null, displayValue: string) => void;
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

  const handleSelectModel = (model: AcessoryModel) => {
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
          onFocus={() => setShowSuggestions(filteredModels.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={
            disabled ? "Select brand first" : "Start typing phone model..."
          }
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

export interface AccessoryProductPayload {
  purchasePrice: number;
  sellingPrice: number;
  taxId?: string;
  accessoryCatalogId?: string;
  category: string;
  quantity?: number;
  variantId: string;
  notes?: string;
  vendorId: string;
  barcode?: string;
  categoryId?: string;
  lowStockThreshold?: number;
  shopId: string;
}

interface AccessoryProductFormProps {
  onSubmit: (payload: AccessoryProductPayload) => void;
  onCancel: () => void;
  initialData?: Partial<AccessoryProductPayload>;
  shopId?: string;
  isEditing?: boolean;
}

interface AccessoryModel {
  id: string;
  name: string;
  memory?: string;
  displayName: string;
  productId: string;
}
interface AccessoryProductFormProps {
  onSubmit: (payload: AccessoryProductPayload) => void;
  onCancel: () => void;
  initialData?: Partial<AccessoryProductPayload>;
  shopId?: string;
  isEditing?: boolean;
}
export function AccessoryProductForm({
  onSubmit,
  onCancel,
  initialData,
  shopId,
  isEditing = false,
}: AccessoryProductFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [brand, setBrand] = useState<string>(initialData?.brand || "");
  const [selectedModel, setSelectedModel] = useState<AccessoryModel | null>(
    null
  );
  const [modelDisplay, setModelDisplay] = useState<string>(
    initialData?.model || ""
  );

  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialData?.purchasePrice?.toString() || ""
  );
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialData?.sellingPrice?.toString() || ""
  );
  const [taxId, setTaxId] = useState<string | undefined>(initialData?.taxId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const authStorage = localStorage.getItem("auth-storage");
  const authState = authStorage ? JSON.parse(authStorage)?.state : null;
  const [variantId, setVariantId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  const [barcode, setBarcode] = useState<string>(initialData?.barcode || "");
  const [vendorId, setVendorId] = useState<string>(initialData?.vendorId || "");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(0);

  const { data: brandsData, isLoading: brandsLoading } = useQuery<{
    brands: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["/api/products/brands"],
  });

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ["/api/products/catalog/accessories/brands", brand],
    queryFn: () => api.accessoryCatalog.getModelsByBrand(brand),
    enabled: !!brand,
  });

  const { data: taxesData, isLoading: taxesLoading } = useQuery({
    queryKey: ["/api/taxes", { isActive: true }],
    queryFn: () => api.taxes.getAll({ isActive: true }),
  });

  useEffect(() => {
    if (!authState?.user?.id) return;

    setVendorsLoading(true);

    api.vendors
      .getAll({ userId: authState.user.id })
      .then((res) => {
        setVendors(
          res.vendors.map((v) => ({
            id: v.id,
            name: v.name,
          }))
        );
      })
      .finally(() => setVendorsLoading(false));
  }, [authState?.user?.id]);

  const brands = useMemo(() => {
    return brandsData?.brands?.map((b) => ({ id: b.id, name: b.name })) || [];
  }, [brandsData]);

  const models = useMemo(() => {
    return modelsData?.models || [];
  }, [modelsData]);

  const taxes = useMemo(() => {
    const taxList = taxesData?.taxes || [];
    return [
      {
        id: "no_tax",
        name: t("products.no_tax"),
        type: "flat" as const,
        value: "0",
        isActive: true,
      },
      ...taxList.map((tax) => ({
        id: tax.id,
        name: `${tax.name} (${
          tax.type === "percent" ? tax.value + "%" : tax.value
        })`,
        type: tax.type as "percent" | "flat",
        value: tax.value,
        isActive: tax.isActive,
      })),
    ];
  }, [taxesData, t]);

  const handleBrandChange = useCallback((newBrand: string) => {
    setBrand(newBrand);
    setSelectedModel(null);
    setModelDisplay("");
  }, []);

  const handleModelChange = useCallback(
    (model: AccessoryModel | null, displayValue: string) => {
      setSelectedModel(model);
      setModelDisplay(displayValue);
      if (model) {
        setVariantId(model.id);
      }
    },
    []
  );
  interface AccessoryModel {
    id: string;
    name: string;
    displayName: string;
    productId: string;
  }

  const handleQuantityChange = useCallback((newQty: number) => {
    const qty = Math.max(1, Math.min(100, newQty));
    setQuantity(qty);
  }, []);

  const finalPrice = useMemo(() => {
    const price = parseFloat(sellingPrice) || 0;
    if (!taxId || taxId === "no_tax") return price;

    const tax = taxes.find((t) => t.id === taxId);
    if (!tax || parseFloat(tax.value) === 0) return price;

    if (tax.type === "percent") {
      return price + (price * parseFloat(tax.value)) / 100;
    } else {
      return price + parseFloat(tax.value);
    }
  }, [sellingPrice, taxId, taxes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!brand) newErrors.brand = t("products.form.brand_required");
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      newErrors.purchasePrice = t("products.form.purchase_price_required");
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      newErrors.sellingPrice = t("products.form.selling_price_required");
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (!selectedModel) {
      return;
    }

    const payload: AccessoryProductPayload = {
      shopId: shopId!, // ✅ REQUIRED
      variantId: variantId!, // ✅ REQUIRED
      quantity,
      purchasePrice: Number(purchasePrice),
      salePrice: Number(sellingPrice), // ✅ rename
      taxId: taxId === "no_tax" ? undefined : taxId,
      vendorId,
      barcode: barcode || undefined,
      notes: notes || undefined,
      lowStockThreshold: lowStockThreshold || 5,
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
        <Label htmlFor="quantity" className="text-sm font-medium">
          {t("products.form.quantity")}{" "}
          <span className="text-destructive">*</span>
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
      <div>
        <Label htmlFor="barcode" className="text-sm font-medium">
          {t("products.form.barcode")}
        </Label>
        <Input
          type="text"
          id="barcode"
          value={barcode}
          placeholder={t("products.form.barcode_placeholder")}
          onChange={(e) => setBarcode(e.target.value)}
          data-testid="input-barcode"
        />
      </div>

      <div>
        <Label htmlFor="lowStockThreshold" className="text-sm font-medium">
          {t("products.form.lowStockThreshold")}
        </Label>
        <Input
          type="number"
          min={0}
          id="lowStockThreshold"
          value={lowStockThreshold}
          placeholder={t("products.form.lowStockThreshold_placeholder")}
          onChange={(e) => setLowStockThreshold(Number(e.target.value))}
          data-testid="input-lowStockThreshold"
        />
      </div>

      <div>
        <Label htmlFor="purchasePrice" className="text-sm font-medium">
          {t("products.form.purchase_price")}{" "}
          <span className="text-destructive">*</span>
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
          <p className="text-destructive text-xs mt-1">
            {errors.purchasePrice}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="sellingPrice" className="text-sm font-medium">
          {t("products.form.selling_price")}{" "}
          <span className="text-destructive">*</span>
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
            <span className="text-muted-foreground">
              {t("products.form.final_price_with_tax")}:
            </span>
            <span className="font-semibold text-lg">
              PKR {finalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          {t("products.form.notes")}
        </Label>
        <Textarea
          id="notes"
          value={notes}
          placeholder={t("products.form.notes_placeholder")}
          onChange={(e) => setNotes(e.target.value)}
          data-testid="input-notes"
        />
      </div>

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
          {initialData
            ? t("products.form.update_mobile")
            : t("products.form.add_accessory")}
        </Button>
      </div>
    </form>
  );
}
