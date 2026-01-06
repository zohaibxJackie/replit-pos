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

export interface AccessoryProductPayload {
  purchasePrice: number;
  salePrice: number;
  taxId?: string;
  accessoryCatalogId?: string;
  quantity?: number;
  variantId: string;
  notes?: string;
  vendorId: string;
  barcode?: string;
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
  const [variantId, setVariantId] = useState<string | null>(
    initialData?.variantId || null
  );
  const [purchasePrice, setPurchasePrice] = useState<string>(
    initialData?.purchasePrice?.toString() || ""
  );
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialData?.sellingPrice?.toString() || ""
  );
  const [taxId, setTaxId] = useState<string | undefined>(initialData?.taxId);
  const [quantity, setQuantity] = useState<number>(initialData?.quantity || 1);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string>(initialData?.vendorId || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [barcode, setBarcode] = useState<string>(initialData?.barcode || "");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    initialData?.lowStockThreshold || 5
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    api.categories.getAll().then((res) => {
      const accessoryCategory = res.categories.find(
        (c) => c.name.toLowerCase() === "accessory"
      );
      setCategoryId(accessoryCategory?.id || null);
    });
  }, []);

  const authStorage = localStorage.getItem("auth-storage");
  const authState = authStorage ? JSON.parse(authStorage)?.state : null;

  const { data: brandsData, isLoading: brandsLoading } = useQuery<{
    brands: Array<{ id: string; name: string }>;
  }>({
    queryKey: ["/api/products/brands"],
  });

  const brands = useMemo(() => brandsData?.brands || [], [brandsData]);
  // ✅ Fetch vendors
  useEffect(() => {
    if (!authState?.user?.id) return;
    setVendorsLoading(true);

    api.vendors
      .getAll({ userId: authState.user.id })
      .then((res) =>
        setVendors(res.vendors.map((v) => ({ id: v.id, name: v.name })))
      )
      .finally(() => setVendorsLoading(false));
  }, [authState?.user?.id]);

  useEffect(() => {
    if (!brands || brands.length === 0) return;
    if (!brand) setBrand(brands[0].id);
  }, [brands, brand]);

  const { data: variantsData, isLoading: variantsLoading } = useQuery({
    queryKey: ["accessory-variants", brand, categoryId],
    queryFn: () =>
      api.accessoryCatalog.getAccessoryVariants({
        brandId: brand!,
        categoryId: categoryId!,
      }),
    enabled: !!brand && !!categoryId, // fetch only after brand & categoryId exist
  });

  const variants = variantsData?.variants || [];

  const { data: taxesData, isLoading: taxesLoading } = useQuery({
    queryKey: ["/api/taxes", { isActive: true }],
    queryFn: () => api.taxes.getAll({ isActive: true }),
  });

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
    if (!variantId) newErrors.variant = "Variant is required";
    if (!purchasePrice || parseFloat(purchasePrice) <= 0)
      newErrors.purchasePrice = t("products.form.purchase_price_required");
    if (!sellingPrice || parseFloat(sellingPrice) <= 0)
      newErrors.sellingPrice = t("products.form.selling_price_required");

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload: AccessoryProductPayload = {
      shopId: shopId!,
      variantId: variantId!,
      quantity,
      purchasePrice: Number(purchasePrice),
      salePrice: Number(sellingPrice),
      taxId: taxId === "no_tax" ? undefined : taxId,
      vendorId,
      barcode: barcode || undefined,
      notes: notes || undefined,
      lowStockThreshold: Number.isFinite(lowStockThreshold)
        ? lowStockThreshold
        : 5,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Brand */}
      <div>
        <Label htmlFor="brand" className="text-sm font-medium">
          {t("products.form.brand")} <span className="text-destructive">*</span>
        </Label>
        <SearchableSelect
          items={brands}
          placeholder={t("products.form.select_brand")}
          value={brand}
          onChange={setBrand}
          isLoading={brandsLoading}
        />
        {errors.brand && (
          <p className="text-destructive text-xs mt-1">{errors.brand}</p>
        )}
      </div>

      {/* Variant */}
      <div>
        <Label htmlFor="variant" className="text-sm font-medium">
          Variant <span className="text-destructive">*</span>
        </Label>
        <SearchableSelect
          items={variants.map((v) => ({
            id: v.variantId,
            name: v.variantName,
          }))}
          placeholder="Select Variant"
          value={variantId || ""} // keep controlled
          onChange={setVariantId}
          disabled={variantsLoading || !brand} // only disable while loading or brand not selected
          isLoading={variantsLoading}
        />
        {errors.variant && (
          <p className="text-destructive text-xs mt-1">{errors.variant}</p>
        )}
      </div>

      {/* Vendors */}
      <div>
        <Label htmlFor="vendor" className="text-sm font-medium">
          Vendor
        </Label>
        <SearchableSelect
          items={vendors}
          placeholder="Select Vendor"
          value={vendorId}
          onChange={setVendorId}
          isLoading={vendorsLoading}
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

      {/* Quantity */}
      <div>
        <Label htmlFor="quantity" className="text-sm font-medium">
          {t("products.form.quantity")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder={t("products.form.enter_quantity")}
        />
      </div>

      {/* Barcode */}
      <div>
        <Label htmlFor="barcode" className="text-sm font-medium">
          {t("products.form.barcode")}
        </Label>
        <Input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder={t("products.form.barcode_placeholder")}
        />
      </div>

      {/* Purchase Price */}
      <div>
        <Label htmlFor="purchasePrice" className="text-sm font-medium">
          {t("products.form.purchase_price")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          placeholder={t("products.form.enter_purchase_price")}
        />
        {errors.purchasePrice && (
          <p className="text-destructive text-xs mt-1">
            {errors.purchasePrice}
          </p>
        )}
      </div>

      {/* Selling Price */}
      <div>
        <Label htmlFor="sellingPrice" className="text-sm font-medium">
          {t("products.form.selling_price")}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          placeholder={t("products.form.enter_selling_price")}
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
      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          {t("products.form.notes")}
        </Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("products.form.notes_placeholder")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Update Accessory" : "Add Accessory"}
        </Button>
      </div>
    </form>
  );
}
