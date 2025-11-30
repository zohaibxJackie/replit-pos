import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import DataTable from "@/components/DataTable";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/context/TitleContext";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

type TaxType = "percent" | "flat";

interface TaxItem {
  id: string;
  name: string;
  type: TaxType;
  value: number;
}

export default function Tax() {
  useAuth("catalogTax");

  const { setTitle } = useTitle();
  const { toast } = useToast();

  useEffect(() => {
    setTitle("Taxes");
    return () => setTitle("Business Dashboard");
  }, [setTitle]);

  // initial mock taxes
  const [taxes, setTaxes] = useState<TaxItem[]>(() => [
    { id: "t2", name: "GST 5%", type: "percent", value: 5},
    { id: "t3", name: "Service Fee", type: "flat", value: 50},
  ]);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxItem | null>(null);

  // form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<TaxType>("percent");
  const [formValue, setFormValue] = useState<number | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // table filters (DataTable will call onFilterChange)
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Derived data for DataTable (filtering handled by DataTable UI but we still do a simple client-side filter for our mock)
  const filteredTaxes = useMemo(() => {
    if (!filters.name && !filters.type) return taxes;
    return taxes.filter((t) => {
      const matchName = !filters.name || t.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchType = !filters.type || t.type === filters.type;
      return matchName && matchType;
    });
  }, [taxes, filters]);

  // Table columns
  const columns = [
    { key: "name", label: "Name", filterType: "text" },
    {
      key: "type",
      label: "Type",
      filterType: "select",
      filterOptions: ["percent", "flat"],
      render: (val: TaxType) => (val === "percent" ? "Percentage" : "Flat"),
    },
    {
      key: "value",
      label: "Value",
      filterType: "none",
      render: (val: number, row: TaxItem) =>
        row.type === "percent" ? `${val}%` : `$${Number(val).toFixed(2)}`,
    }
  ];

  // open add modal
  const openAddModal = () => {
    setEditingTax(null);
    setFormName("");
    setFormType("percent");
    setFormValue("");
    setErrors({});
    setIsModalOpen(true);
  };

  // open edit modal
  const openEditModal = (tax: TaxItem) => {
    setEditingTax(tax);
    setFormName(tax.name);
    setFormType(tax.type);
    setFormValue(tax.value);
    setErrors({});
    setIsModalOpen(true);
  };

  // delete handler
  const handleDelete = (tax: TaxItem) => {
    const ok = window.confirm(`Delete tax "${tax.name}"? This action cannot be undone.`);
    if (!ok) return;
    setTaxes((prev) => prev.filter((t) => t.id !== tax.id));
    toast({ title: "Tax deleted", description: `${tax.name} removed.` });
  };

  // validate form
  const validate = () => {
    const e: Record<string, string> = {};
    if (!formName.trim()) e.name = "Name is required";
    if (formValue === "" || Number.isNaN(Number(formValue))) e.value = "Value is required";
    else {
      const v = Number(formValue);
      if (v < 0) e.value = "Value must be >= 0";
      if (formType === "percent" && (v < 0 || v > 100)) e.value = "Percentage must be between 0 and 100";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // submit (add or update)
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    const payload: Omit<TaxItem, "id" | "createdAt"> = {
      name: formName.trim(),
      type: formType,
      value: Number(formValue),
    };

    if (editingTax) {
      // update
      setTaxes((prev) => prev.map((t) => (t.id === editingTax.id ? { ...t, ...payload } : t)));
      toast({ title: "Tax updated", description: `${payload.name} updated.` });
    } else {
      // add
      const newTax: TaxItem = {
        id: `tax_${Date.now()}`,
        ...payload,
      };
      setTaxes((prev) => [newTax, ...prev]);
      toast({ title: "Tax added", description: `${payload.name} created.` });
    }

    setIsModalOpen(false);
  };

  // Render action buttons for each row
  const renderActions = (row: TaxItem) => (
    <div className="flex items-center gap-2 justify-end">
      <Button
        size="icon"
        variant="ghost"
        title="Edit"
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
        title="Delete"
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Taxes</h2>
        <div>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tax
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTaxes}
        showActions
        renderActions={renderActions}
        onFilterChange={(f) => setFilters(f)}
      />

      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold">{editingTax ? "Edit Tax" : "Create New Tax"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Name</Label>
            <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Tax name" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label>Type</Label>
            <Select value={formType} onValueChange={(v) => setFormType(v as TaxType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentage</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value {formType === "percent" ? "(%)" : "$"}</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={formValue}
              onChange={(e) => setFormValue(e.target.value === "" ? "" : Number(e.target.value))}
            />
            {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingTax ? "Update Tax" : "Create Tax"}</Button>
          </div>
        </form>
      </FormPopupModal>
    </div>
  );
}
