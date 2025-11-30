import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import CategoryPopup from "@/components/ui/categorypopup";

type CategoryType = "primary" | "generic";

type Level3 = {
  name: string;
};

type Level2 = {
  id: string;
  name: string;
  level3: Level3[];
};

type Category = {
  id: number;
  name: string; // Level 1
  level2: Level2[];
};

export default function Category() {
  useAuth("catalogCategory");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { toast } = useToast();
  

  // set title once on mount (safe)
  useEffect(() => {
    setTitle(t("admin.sub_pages.category.title"));
    return () => setTitle("Business Dashboard");
    // intentionally empty deps to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // UI state
  const [activeType, setActiveType] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  // Initialize mock data as arrays (always arrays)
  const [primaryCategories, setPrimaryCategories] = useState<Category[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Primary ${i + 1}`,
        level2: [
          { id: `p-${i + 1}-a`, name: `P${i + 1}-L2-A`, level3: [{ name: "A1" }, { name: "A2" }] },
          { id: `p-${i + 1}-b`, name: `P${i + 1}-L2-B`, level3: [{ name: "B1" }] },
        ],
      }))
  );

  const [genericCategories, setGenericCategories] = useState<Category[]>(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Generic ${i + 1}`,
        level2: [{ id: `g-${i + 1}-1`, name: `G${i + 1}-L2-1`, level3: [{ name: "X" }] }],
      }))
  );

  // Helpers for active list
  const activeList = !activeType ? primaryCategories : genericCategories;
  const setActiveList = (list: Category[]) => {
    if (!activeType) setPrimaryCategories(list);
    else setGenericCategories(list);
  };

  // search + filtered + paginated (memoized)
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!Array.isArray(activeList)) return [];
    if (!search) return activeList;
    return activeList.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [activeList, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  // simple local id generator for Level2 items
  const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  // open add / edit modal
  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    if (!confirm(t("admin.sub_pages.category.messages.delete_confirmation", { name: cat.name }))) return;
    const updated = activeList.filter((c) => c.id !== cat.id);
    setActiveList(updated);
    toast({ 
      title: t("admin.sub_pages.category.messages.category_deleted"),
      description: t("admin.sub_pages.category.messages.category_deleted_description")
    });
  };

  const handleSubmit = (categories: { name: string; level2: { id?: string; name: string; level3: { name: string }[] }[] }[]) => {
    if (categories.length === 0) {
      toast({ 
        title: t("admin.sub_pages.category.messages.validation.at_least_one"),
        variant: "destructive" 
      });
      return;
    }

    if (editing) {
      const updatedCategory: Category = {
        id: editing.id,
        name: categories[0].name,
        level2: categories[0].level2.map((submittedL2) => ({
          id: submittedL2.id || makeId(),
          name: submittedL2.name,
          level3: submittedL2.level3,
        })),
      };
      const updated = activeList.map((c) => (c.id === editing.id ? updatedCategory : c));
      setActiveList(updated);
      toast({ 
        title: t("admin.sub_pages.category.messages.category_updated"),
        description: t("admin.sub_pages.category.messages.category_updated_description", { name: updatedCategory.name })
      });
    } else {
      let nextId = Math.max(...activeList.map(c => c.id), 0) + 1;
      const newCategories: Category[] = categories.map((cat) => {
        const category: Category = {
          id: nextId++,
          name: cat.name,
          level2: cat.level2.map((l2) => ({
            id: makeId(),
            name: l2.name,
            level3: l2.level3,
          })),
        };
        return category;
      });
      setActiveList([...activeList, ...newCategories]);
      
      if (newCategories.length === 1) {
        toast({ 
          title: t("admin.sub_pages.category.messages.category_added"),
          description: t("admin.sub_pages.category.messages.category_added_description", { name: newCategories[0].name })
        });
      } else {
        toast({ 
          title: t("admin.sub_pages.category.messages.categories_added"),
          description: t("admin.sub_pages.category.messages.categories_added_description", { count: newCategories.length })
        });
      }
    }
    
    setEditing(null);
  };

  // columns — memoized; avoid unstable deps (do not include `t`)
  const columns = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        filterType: "none",
        render: (_: any, __: any, idx: number) => (page - 1) * limit + idx + 1,
      },
      { key: "name", label: t("admin.sub_pages.category.level1") || "Level 1", filterType: "text" },
      {
        key: "level2",
        label: t("admin.sub_pages.category.level2") || "Level 2",
        filterType: "none",
        // DataTable will pass row['level2'] as `value`
        render: (value: Level2[]) => <div className="max-w-xs truncate">{(value || []).map((l) => l.name).join(", ")}</div>,
      },
      {
        key: "level3",
        label: t("admin.sub_pages.category.level3") || "Level 3",
        filterType: "none",
        // DataTable passes value,row,index — we need row to flatten level3
        render: (_value: any, row: Category) => (
          <div className="max-w-xs truncate">{(row.level2 || []).flatMap((l) => l.level3).map(l3 => l3.name).join(", ")}</div>
        ),
      },
    ],
    // only re-create when page or limit change (safe)
    [page, limit, t]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={activeType}
              onChange={(e) => {
                setActiveType(!activeType);
                setPage(1);
              }}
              className="h-4 w-4"
              data-testid="checkbox-show-generic"
            />
            <span className="text-sm">{t("admin.sub_pages.category.filters.show_generic")}</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
          <Button onClick={openAdd} data-testid="button-add-category">
            <Plus className="w-4 h-4 mr-2" />
            {t("admin.sub_pages.category.add_button")}
          </Button>
        </div>
      </div>

      {/* Table — render only when paginated is an array */}
      <DataTable
        columns={columns}
        data={paginated}
        showActions
        renderActions={(row: Category) => (
          <div className="flex justify-end gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => openEdit(row)}
              data-testid={`button-edit-${row.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => handleDelete(row)}
              data-testid={`button-delete-${row.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
        onFilterChange={() => {

        }}
      />

      <TablePagination page={page} limit={limit} total={filtered.length} onPageChange={setPage} />

      <CategoryPopup
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        // if active type is true, it means it is generic and if it is false, means it's mobile
        isGeneric={activeType}
        initialData={editing ? [{ name: editing.name, level2: editing.level2 }] : undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
