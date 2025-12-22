import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Textarea } from "./ui/textarea";
import { useAuthStore } from "@/store/authStore";

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

interface UpdateProductPayload {
  variantId?: string;
  primaryImei?: string;
  secondaryImei?: string;
  serialNumber?: string;
  barcode?: string;
  purchasePrice?: number;
  salePrice?: number;
  notes?: string;
  taxId?: string;
  lowStockThreshold?: number;
}

interface UpdateProductFormProps {
  onSubmit: (payload: UpdateProductPayload) => void;
  onCancel: () => void;
  initialData?: {
    variantId?: string;
    primaryImei?: string;
    secondaryImei?: string;
    serialNumber?: string;
    barcode?: string;
    purchasePrice?: number;
    salePrice?: number;
    notes?: string;
    taxId?: string;
    lowStockThreshold?: number;
    productName?: string;
  };
  shopId?: string;
  isLoading?: boolean;
}

export default function UpdateProductForm({
  onSubmit,
  onCancel,
  initialData,
  shopId,
  isLoading = false,
}: UpdateProductFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<UpdateProductPayload>({
    variantId: initialData?.variantId || "",
    primaryImei: initialData?.primaryImei || "",
    secondaryImei: initialData?.secondaryImei || "",
    serialNumber: initialData?.serialNumber || "",
    barcode: initialData?.barcode || "",
    purchasePrice: initialData?.purchasePrice,
    salePrice: initialData?.salePrice,
    notes: initialData?.notes || "",
    taxId: initialData?.taxId || "",
    lowStockThreshold: initialData?.lowStockThreshold || 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        variantId: initialData.variantId || "",
        primaryImei: initialData.primaryImei || "",
        secondaryImei: initialData.secondaryImei || "",
        serialNumber: initialData.serialNumber || "",
        barcode: initialData.barcode || "",
        purchasePrice: initialData.purchasePrice,
        salePrice: initialData.salePrice,
        notes: initialData.notes || "",
        taxId: initialData.taxId || "",
        lowStockThreshold: initialData.lowStockThreshold || 5,
      });
      setErrors({});
    }
  }, [initialData]);

  // Fetch variants
  const { data: variantsData, isLoading: variantsLoading } = useQuery({
    queryKey: ['/api/products/variants'],
    queryFn: () => api.products.getVariants(),
  });

  const { data: taxesData } = useQuery({
    queryKey: ['/api/taxes'],
    queryFn: () => api.taxes.getAll(),
  });

  const variants = (variantsData?.variants || []) as any[];
  const taxes = (taxesData?.taxes || []) as Tax[];

  const handleChange = (field: keyof UpdateProductPayload, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.purchasePrice !== undefined && formData.purchasePrice < 0) {
      newErrors.purchasePrice = "Purchase price cannot be negative";
    }

    if (formData.salePrice !== undefined && formData.salePrice < 0) {
      newErrors.salePrice = "Sale price cannot be negative";
    }

    if (formData.primaryImei && formData.secondaryImei && formData.primaryImei === formData.secondaryImei) {
      newErrors.secondaryImei = "Primary and Secondary IMEI cannot be the same";
    }

    if (formData.lowStockThreshold !== undefined && formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = "Low stock threshold cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="variantId">{t("admin.products.form.variant")}</Label>
        <Select
          value={formData.variantId || "none"}
          onValueChange={(value) => handleChange("variantId", value)}
          disabled={variantsLoading}
        >
          <SelectTrigger id="variantId" data-testid="select-variant-update">
            {variantsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder={t("admin.products.form.select_variant")} />
            )}
          </SelectTrigger>
          <SelectContent>
            {variants.map((variant: MobileModel) => (
              <SelectItem key={variant.id} value={variant.id}>
                {variant.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primaryImei">{t("admin.products.form.primary_imei")}</Label>
        <Input
          id="primaryImei"
          type="text"
          placeholder="Enter primary IMEI"
          value={formData.primaryImei || "none"}
          onChange={(e) => handleChange("primaryImei", e.target.value)}
          data-testid="input-primary-imei-update"
        />
        {errors.primaryImei && (
          <p className="text-sm text-destructive">{errors.primaryImei}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondaryImei">{t("admin.products.form.secondary_imei")}</Label>
        <Input
          id="secondaryImei"
          type="text"
          placeholder="Enter secondary IMEI (optional)"
          value={formData.secondaryImei || "none"}
          onChange={(e) => handleChange("secondaryImei", e.target.value)}
          data-testid="input-secondary-imei-update"
        />
        {errors.secondaryImei && (
          <p className="text-sm text-destructive">{errors.secondaryImei}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="serialNumber">{t("admin.products.form.serial_number")}</Label>
        <Input
          id="serialNumber"
          type="text"
          placeholder="Enter serial number (optional)"
          value={formData.serialNumber || "none"}
          onChange={(e) => handleChange("serialNumber", e.target.value)}
          data-testid="input-serial-number-update"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="barcode">{t("admin.products.form.barcode")}</Label>
        <Input
          id="barcode"
          type="text"
          placeholder="Enter barcode (optional)"
          value={formData.barcode || "none"}
          onChange={(e) => handleChange("barcode", e.target.value)}
          data-testid="input-barcode-update"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">{t("admin.products.form.purchase_price")}</Label>
          <Input
            id="purchasePrice"
            type="number"
            placeholder="0"
            step="0.01"
            value={formData.purchasePrice ?? "none"}
            onChange={(e) => handleChange("purchasePrice", e.target.value ? parseFloat(e.target.value) : undefined)}
            data-testid="input-purchase-price-update"
          />
          {errors.purchasePrice && (
            <p className="text-sm text-destructive">{errors.purchasePrice}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salePrice">{t("admin.products.form.sale_price")}</Label>
          <Input
            id="salePrice"
            type="number"
            placeholder="0"
            step="0.01"
            value={formData.salePrice ?? "none"}
            onChange={(e) => handleChange("salePrice", e.target.value ? parseFloat(e.target.value) : undefined)}
            data-testid="input-sale-price-update"
          />
          {errors.salePrice && (
            <p className="text-sm text-destructive">{errors.salePrice}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxId">{t("admin.products.form.tax")}</Label>
        <Select
          value={formData.taxId || "none"}
          onValueChange={(value) =>
            handleChange("taxId", value === "none" ? undefined : value)
          }
        >
          <SelectTrigger id="taxId" data-testid="select-tax-update">
            <SelectValue placeholder={t("admin.products.form.select_tax")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {t("admin.products.form.no_tax")}
            </SelectItem>
            {taxes.map((tax: Tax) => (
              <SelectItem key={tax.id} value={tax.id}>
                {tax.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      <div className="space-y-2">
        <Label htmlFor="lowStockThreshold">{t("admin.products.form.low_stock_threshold")}</Label>
        <Input
          id="lowStockThreshold"
          type="number"
          placeholder="5"
          value={formData.lowStockThreshold ?? "none"}
          onChange={(e) => handleChange("lowStockThreshold", e.target.value ? parseInt(e.target.value) : undefined)}
          data-testid="input-low-stock-threshold-update"
        />
        {errors.lowStockThreshold && (
          <p className="text-sm text-destructive">{errors.lowStockThreshold}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("admin.products.form.notes")}</Label>
        <Textarea
          id="notes"
          placeholder="Enter notes (optional)"
          value={formData.notes || "none"}
          onChange={(e) => handleChange("notes", e.target.value)}
          data-testid="textarea-notes-update"
          className="min-h-20"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="button-cancel-update"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="button-update-product"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("common.updating")}
            </>
          ) : (
            t("common.update")
          )}
        </Button>
      </div>
    </form>
  );
}
