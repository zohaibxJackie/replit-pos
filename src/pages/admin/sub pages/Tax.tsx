import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/DataTable";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/context/TitleContext";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/utils/currency";

interface TaxItem {
  id: string;
  shopId: string;
  name: string;
  type: "flat";
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Tax() {
  useAuth("catalogTax");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const { format } = useCurrency();

  useEffect(() => {
    setTitle(t("tax.title"));
    return () => setTitle(t("admin.titles.admin"));
  }, [setTitle, t]);

  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formValue, setFormValue] = useState<number | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await api.taxes.getAll();
      setTaxes(response.taxes);
    } catch (error) {
      console.error("Failed to fetch taxes:", error);
      toast({ 
        title: t("tax.toast.error"), 
        description: t("tax.toast.fetch_failed"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const filteredTaxes = useMemo(() => {
    if (!filters.name) return taxes;
    return taxes.filter((tx) => {
      const matchName = !filters.name || tx.name.toLowerCase().includes(filters.name.toLowerCase());
      return matchName;
    });
  }, [taxes, filters]);

  const columns = [
    { key: "name", label: t("tax.columns.name"), filterType: "text" as const },
    {
      key: "value",
      label: t("tax.columns.value"),
      filterType: "none" as const,
      render: (val: string) => `${val}%`,
    }
  ];

  const openAddModal = () => {
    setEditingTax(null);
    setFormName("");
    setFormValue("");
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (tax: TaxItem) => {
    setEditingTax(tax);
    setFormName(tax.name);
    setFormValue(Number(tax.value));
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = async (tax: TaxItem) => {
    const ok = window.confirm(t("tax.delete_confirm", { name: tax.name }));
    if (!ok) return;
    
    try {
      await api.taxes.delete(tax.id);
      setTaxes((prev) => prev.filter((tx) => tx.id !== tax.id));
      toast({ 
        title: t("tax.toast.deleted"), 
        description: t("tax.toast.deleted_desc", { name: tax.name })
      });
    } catch (error) {
      console.error("Failed to delete tax:", error);
      toast({ 
        title: t("tax.toast.error"), 
        description: t("tax.toast.delete_failed"),
        variant: "destructive"
      });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formName.trim()) e.name = t("tax.validation.name_required");
    if (formValue === "" || Number.isNaN(Number(formValue))) {
      e.value = t("tax.validation.value_required");
    } else {
      const v = Number(formValue);
      if (v < 0) e.value = t("tax.validation.value_positive");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (editingTax) {
        const response = await api.taxes.update(editingTax.id, {
          name: formName.trim(),
          value: Number(formValue),
        });
        setTaxes((prev) =>
          prev.map((tx) => (tx.id === editingTax.id ? { ...tx, ...response.tax } : tx))
        );
        toast({ 
          title: t("tax.toast.updated"), 
          description: t("tax.toast.updated_desc", { name: formName.trim() })
        });
      } else {
        const response = await api.taxes.create({
          name: formName.trim(),
          value: Number(formValue),
        });
        setTaxes((prev) => [response.tax as TaxItem, ...prev]);
        toast({ 
          title: t("tax.toast.created"), 
          description: t("tax.toast.created_desc", { name: formName.trim() })
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save tax:", error);
      toast({ 
        title: t("tax.toast.error"), 
        description: editingTax ? t("tax.toast.update_failed") : t("tax.toast.create_failed"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActions = (row: TaxItem) => (
    <div className="flex items-center gap-2 justify-center">
      <Button
        size="icon"
        variant="ghost"
        title={t("tax.actions.edit")}
        data-testid={`button-edit-tax-${row.id}`}
        onClick={(ev) => {
          ev.stopPropagation();
          openEditModal(row);
        }}
      >
        <Edit className="w-4 h-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        title={t("tax.actions.delete")}
        data-testid={`button-delete-tax-${row.id}`}
        onClick={(ev) => {
          ev.stopPropagation();
          handleDelete(row);
        }}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <div>
          <Button onClick={openAddModal} data-testid="button-add-tax">
            <Plus className="w-4 h-4 mr-2" />
            {t("tax.add_tax")}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTaxes}
        showActions
        renderActions={renderActions}
        onFilterChange={(f) => setFilters(f)}
        loading={loading}
      />

      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold" data-testid="text-tax-modal-title">
          {editingTax ? t("tax.modal.edit_title") : t("tax.modal.create_title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>{t("tax.form.name")}</Label>
            <Input 
              value={formName} 
              onChange={(e) => setFormName(e.target.value)} 
              placeholder={t("tax.form.name_placeholder")}
              data-testid="input-tax-name"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label>{t("tax.form.value")}</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={formValue}
              onChange={(e) => setFormValue(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={t("tax.form.value_placeholder")}
              data-testid="input-tax-value"
            />
            {errors.value && <p className="text-xs text-destructive mt-1">{errors.value}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} data-testid="button-tax-cancel">
              {t("tax.form.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="button-tax-submit">
              {isSubmitting ? t("tax.form.saving") : (editingTax ? t("tax.form.update") : t("tax.form.create"))}
            </Button>
          </div>
        </form>
      </FormPopupModal>
    </div>
  );
}
