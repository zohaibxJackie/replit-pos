import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import FormPopupModal from "@/components/ui/FormPopupModal";

type Reason = {
  id: number;
  title: string;
};

export default function ManageReasons() {
  useAuth("catalogManageReasons");

  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { toast } = useToast();

  useEffect(() => {
    setTitle(t("admin.catalog.manage_reasons.title"));
    return () => setTitle("Business Dashboard");
  }, [t, setTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reason | null>(null);

  const [reasons, setReasons] = useState<Reason[]>([
    { id: 1, title: "Product Expired" },
    { id: 2, title: "Damaged Item" },
    { id: 3, title: "Customer Return" },
  ]);

  const [formTitle, setFormTitle] = useState("");

  const filtered = useMemo(() => {
    if (!search) return reasons;
    return reasons.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [reasons, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const openAdd = () => {
    setEditing(null);
    setFormTitle("");
    setIsModalOpen(true);
  };

  const openEdit = (reason: Reason) => {
    setEditing(reason);
    setFormTitle(reason.title);
    setIsModalOpen(true);
  };

  const handleDelete = (reason: Reason) => {
    if (!confirm(`Delete reason "${reason.title}"?`)) return;
    setReasons(reasons.filter((r) => r.id !== reason.id));
    toast({ title: "Reason deleted successfully" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast({ title: "Please enter a reason title", variant: "destructive" });
      return;
    }

    if (editing) {
      setReasons(
        reasons.map((r) =>
          r.id === editing.id ? { ...r, title: formTitle } : r
        )
      );
      toast({ title: "Reason updated successfully" });
    } else {
      const newReason: Reason = {
        id: Math.max(...reasons.map((r) => r.id), 0) + 1,
        title: formTitle,
      };
      setReasons([...reasons, newReason]);
      toast({ title: "Reason added successfully" });
    }

    setIsModalOpen(false);
    setFormTitle("");
    setEditing(null);
  };

  const columns = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        filterType: "none",
        render: (_: any, __: any, idx: number) => (page - 1) * limit + idx + 1,
      },
      {
        key: "title",
        filterType: "none",
        label: t("admin.catalog.manage_reasons.column.reason_title"),
      },
    ],
    [page, limit]
  );

  return (
    <div className="space-y-6">
      {/* Top controls */}
      <div className="flex items-center justify-end">
        

        <div className="flex items-center gap-3">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.catalog.manage_reasons.button.add')}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginated}
        showActions
        renderActions={(row: Reason) => (
          <div className="flex justify-end gap-2">
            <Button size="icon" variant="ghost" onClick={() => openEdit(row)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(row)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <TablePagination page={page} limit={limit} total={filtered.length} onPageChange={setPage} />

      {/* Form Modal */}
      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold">
            {editing ? t('admin.catalog.manage_reasons.popup.title2') : t('admin.catalog.manage_reasons.popup.title')}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">{t('admin.catalog.manage_reasons.popup.reason_title')}</label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={t('admin.catalog.manage_reasons.placeholder.main')}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Update" : "Create"}</Button>
          </div>
        </form>
      </FormPopupModal>
    </div>
  );
}
