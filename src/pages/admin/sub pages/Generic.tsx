import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Printer, Boxes, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { printElement } from "@/utils/print";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTitle } from '@/context/TitleContext';

export default function GenericProducts() {
    useAuth("catalogGeneric");
    const { toast } = useToast();
    const { t } = useTranslation();
    const {setTitle} = useTitle();
    useEffect(() => {
        setTitle(t("admin.generic.title"));      
        return () => setTitle('Business Dashboard'); 
      }, [setTitle]);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [viewingProduct, setViewingProduct] = useState<any | null>(null);

    const [products, setProducts] = useState(
        Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            category: ["Mobiles", "Accessories", "Laptops"][i % 3],
            name: `Product ${i + 1}`,
            ean: `EAN00${i + 1}`,
            stock: Math.floor(Math.random() * 20),
            buyPrice: 200 + i * 10,
            salePrice: 250 + i * 15,
        }))
    );

    const [activeTab, setActiveTab] = useState<"add" | "return" | "garbage">("add");
    const [stockSearch, setStockSearch] = useState("");

    const searchedProducts = useMemo(() => {
        if (!stockSearch.trim()) return products;
        return products.filter((p) =>
            p.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
            p.ean.toLowerCase().includes(stockSearch.toLowerCase())
        );
    }, [stockSearch, products]);




    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
    const [isManageStockOpen, setIsManageStockOpen] = useState(false);

    const [categoryForm, setCategoryForm] = useState({ name: "", newName: "" });
    const [categoryToEdit, setCategoryToEdit] = useState<string | null>(null);

    const [stockForm, setStockForm] = useState({
        productId: 0,
        mode: "add" as "add" | "return",
        qty: 0,
    });

    const [categories, setCategories] = useState<string[]>([]);
    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryForm.name.trim()) return;

        // check if category already exists
        if (categories.includes(categoryForm.name)) {
            alert("Category already exists!");
            return;
        }

        setCategories((prev) => [...prev, categoryForm.name]);
        setCategoryForm({ name: "", newName: "" });
        setIsCreateCategoryOpen(false);
    };
    const handleEditCategory = (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryToEdit || !categoryForm.newName.trim()) return;

        setCategories((prev) =>
            prev.map((c) => (c === categoryToEdit ? categoryForm.newName : c))
        );

        setCategoryForm({ name: "", newName: "" });
        setCategoryToEdit(null);
        setIsEditCategoryOpen(false);
    };
    const handleStockSubmit = (
        e: React.FormEvent,
        mode: "add" | "return" | "garbage",
        product: any
    ) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const qty = Number(formData.get("quantity"));

        if (isNaN(qty) || qty <= 0) return;

        setProducts((prev) =>
            prev.map((p) =>
                p.id === product.id
                    ? {
                        ...p,
                        stock:
                            mode === "add"
                                ? p.stock + qty
                                : Math.max(p.stock - qty, 0),
                    }
                    : p
            )
        );

        let title = "";
        let description = "";

        if (mode === "add") {
            title = "Stock Added";
            description = `${qty} items added to ${product.name}`;
        } else if (mode === "return") {
            title = "Stock Returned";
            description = `${qty} items returned from ${product.name}`;
        } else if (mode === "garbage") {
            title = "Moved to Garbage";
            description = `${qty} items of ${product.name} moved to garbage.`;
        }

        toast({ title, description });
    };



    const [formData, setFormData] = useState({
        category: "",
        name: "",
        ean: "",
        stock: 0,
        buyPrice: 0,
        salePrice: 0,
    });

    // ✅ Filtering
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesCategory = !filters.category || p.category === filters.category;
            const matchesName =
                !filters.name ||
                p.name.toLowerCase().includes(filters.name.toLowerCase());
            const matchesEan =
                !filters.ean ||
                p.ean.toLowerCase().includes(filters.ean.toLowerCase());
            return matchesCategory && matchesName && matchesEan;
        });
    }, [products, filters]);

    // ✅ Pagination
    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredProducts.slice(start, start + limit);
    }, [filteredProducts, page, limit]);

    // ✅ Handle form inputs
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Open Create/Edit Modal
    const handleOpenModal = (product?: any) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
        } else {
            setEditingProduct(null);
            setFormData({
                category: "",
                name: "",
                ean: "",
                stock: 0,
                buyPrice: 0,
                salePrice: 0,
            });
        }
        setIsModalOpen(true);
    };

    // ✅ Save Product
    const handleSubmitProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingProduct) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === editingProduct.id ? { ...p, ...formData } : p
                )
            );
            toast({ title: "Product Updated", description: `${formData.name} updated successfully.` });
        } else {
            const newProduct = {
                id: products.length + 1,
                ...formData,
            };
            setProducts([...products, newProduct]);
            toast({ title: "Product Added", description: `${formData.name} added successfully.` });
        }
        setIsModalOpen(false);
    };

    // ✅ Print single row
    const handlePrintRow = async (row: any) => {
        const container = document.createElement("div");
        container.id = "product-print-container";
        container.innerHTML = `<div style="padding:30px;">         <h2>Product Details</h2>         <table><tbody>
          ${Object.entries({
            Category: row.category,
            "Product Name": row.name,
            "EAN/SKU/UPC": row.ean,
            "Stock": row.stock,
            "Buy Price": row.buyPrice,
            "Sale Price": row.salePrice,
        })
                .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
                .join("")}         </tbody></table>       </div>`;
        document.body.appendChild(container);
        await printElement("product-print-container", {
            title: `Product - ${row.name}`,
            onAfterPrint: () => document.body.removeChild(container),
        });
    };

    // ✅ Columns
    const columns = [
        {
            key: "index",
            label: "#",
            filterType: "none",
            render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
        },
        {
            key: "category",
            label: "Category",
            filterType: "select",
            filterOptions: ["Mobiles", "Accessories", "Laptops"],
        },
        { key: "name", label: "Product Name", filterType: "text" },
        { key: "ean", label: "EAN/SKU/UPC", filterType: "text" },
        {
            key: "stock",
            label: "Stock",
            filterType: "none",
            render: (val: number) => (<Badge variant={val > 0 ? "default" : "destructive"}>{val}</Badge>
            ),
        },
        { key: "buyPrice", label: "Buy Price", filterType: "none" },
        { key: "salePrice", label: "Sale Price", filterType: "none" },
    ];

    return (<div className="space-y-6">
        {/* Header */}
        <div className="flex justify-end flex-col gap-8">
            <div className="flex items-center justify-end gap-3 flex-wrap">

                <Button onClick={() => setIsCreateCategoryOpen(true)} data-testid="button-create-category">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create New Category</span>
                    <span className="sm:hidden">New Category</span>
                </Button>
                <Button variant="outline" onClick={() => setIsEditCategoryOpen(true)} data-testid="button-edit-category">
                    <Edit className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Edit Category</span>
                    <span className="sm:hidden">Edit Cat.</span>
                </Button>
                <Button variant="outline" onClick={() => handleOpenModal()} data-testid="button-create-product">
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create New Product</span>
                    <span className="sm:hidden">New Product</span>
                </Button>
                <Button variant="outline" onClick={() => setIsManageStockOpen(true)} data-testid="button-manage-stock">
                    <Boxes className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Manage Stock</span>
                    <span className="sm:hidden">Stock</span>
                </Button>
            </div>

            <div className="flex w-full justify-end">
                <TablePageSizeSelector
                    limit={limit}
                    onChange={(val) => {
                        setLimit(val);
                        setPage(1);
                    }}
                />
            </div>
        </div>

        {/* Table */}
        <DataTable
            columns={columns}
            data={paginatedProducts}
            showActions
            renderActions={(row) => (
                <div className="flex justify-end gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                        onClick={() => setViewingProduct(row)}
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 hover:bg-amber-100 hover:text-amber-600"
                        onClick={() => handlePrintRow(row)}
                        title="Print"
                    >
                        <Printer className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleOpenModal(row)}
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>
            )}
            onFilterChange={(f) => {
                setFilters(f);
                setPage(1);
            }}
        />

        {/* Pagination */}
        <TablePagination
            page={page}
            limit={limit}
            total={filteredProducts.length}
            onPageChange={setPage}
        />

        {/* Create/Edit Modal */}
        <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h2 className="text-2xl font-semibold mb-4">
                {editingProduct
                    ? t("admin.generic.modals.product.editTitle")
                    : t("admin.generic.modals.product.createTitle")}
            </h2>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
                {/* Category */}
                <div>
                    <Label>{t("admin.generic.modals.product.category")}</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, category: val }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={t("admin.generic.modals.product.selectCategoryPlaceholder")}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mobiles">Mobiles</SelectItem>
                            <SelectItem value="Accessories">Accessories</SelectItem>
                            <SelectItem value="Laptops">Laptops</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Product Name */}
                <div>
                    <Label>{t("admin.generic.modals.product.productName")}</Label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                    />
                </div>

                {/* EAN/SKU/UPC */}
                <div>
                    <Label>{t("admin.generic.modals.product.ean")}</Label>
                    <Input
                        name="ean"
                        value={formData.ean}
                        onChange={handleFormChange}
                        required
                    />
                </div>

                {/* Stock, Buy Price, Sale Price */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <Label>{t("admin.generic.modals.product.stock")}</Label>
                        <Input
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>{t("admin.generic.modals.product.buyPrice")}</Label>
                        <Input
                            name="buyPrice"
                            type="number"
                            value={formData.buyPrice}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div>
                        <Label>{t("admin.generic.modals.product.salePrice")}</Label>
                        <Input
                            name="salePrice"
                            type="number"
                            value={formData.salePrice}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                    >
                        {t("admin.generic.buttons.cancel")}
                    </Button>
                    <Button type="submit">
                        {editingProduct
                            ? t("admin.generic.buttons.update")
                            : t("admin.generic.buttons.save")}
                    </Button>
                </div>
            </form>
        </FormPopupModal>


        {/* View Modal */}
        <FormPopupModal isOpen={!!viewingProduct} onClose={() => setViewingProduct(null)}>
            {viewingProduct && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">
                        {t("admin.generic.modals.viewProduct.title")}
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <p><strong>{t("admin.generic.modals.viewProduct.fields.category")}:</strong> {viewingProduct.category}</p>
                        <p><strong>{t("admin.generic.modals.viewProduct.fields.productName")}:</strong> {viewingProduct.name}</p>
                        <p><strong>{t("admin.generic.modals.viewProduct.fields.ean")}:</strong> {viewingProduct.ean}</p>
                        <p><strong>{t("admin.generic.modals.viewProduct.fields.stock")}:</strong> {viewingProduct.stock}</p>
                        <p><strong>{t("admin.generic.modals.viewProduct.fields.buyPrice")}:</strong> {viewingProduct.buyPrice}</p>
                        <p><strong>{t("admin.generic.modals.viewProduct.fields.salePrice")}:</strong> {viewingProduct.salePrice}</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => handlePrintRow(viewingProduct)}>
                            <Printer className="w-4 h-4 mr-2" /> {t("admin.generic.buttons.print")}
                        </Button>
                        <Button onClick={() => setViewingProduct(null)}>
                            {t("admin.generic.buttons.close")}
                        </Button>
                    </div>
                </div>
            )}
        </FormPopupModal>

        {/* Create Category Modal */}
        <FormPopupModal isOpen={isCreateCategoryOpen} onClose={() => setIsCreateCategoryOpen(false)}>
            <h2 className="text-2xl font-semibold">{t("admin.generic.modals.createCategory.title")}</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
                <div>
                    <label>{t("admin.generic.modals.createCategory.label")}</label>
                    <Input
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))}
                        required
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                        {t("admin.generic.buttons.cancel")}
                    </Button>
                    <Button type="submit">{t("admin.generic.buttons.create")}</Button>
                </div>
            </form>
        </FormPopupModal>

        {/* Edit Category Modal */}
        <FormPopupModal isOpen={isEditCategoryOpen} onClose={() => setIsEditCategoryOpen(false)}>
            <h2 className="text-2xl font-semibold">{t("admin.generic.modals.editCategory.title")}</h2>
            <form onSubmit={handleEditCategory} className="space-y-4 mt-4">
                <div>
                    <label>{t("admin.generic.modals.editCategory.selectCategory")}</label>
                    <Select
                        value={categoryToEdit ?? "all"}
                        onValueChange={(v) => {
                            setCategoryToEdit(v || null);
                            setCategoryForm((s) => ({ ...s, name: v || "", newName: v || "" }));
                        }}
                    >
                        <SelectTrigger><SelectValue placeholder={t("admin.generic.modals.editCategory.selectCategory")} /></SelectTrigger>
                        <SelectContent>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label>{t("admin.generic.modals.editCategory.newName")}</label>
                    <Input
                        value={categoryForm.newName}
                        onChange={(e) => setCategoryForm((s) => ({ ...s, newName: e.target.value }))}
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
                        {t("admin.generic.buttons.cancel")}
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => setIsEditCategoryOpen(false)}>
                        {t("admin.generic.buttons.delete")}
                    </Button>
                    <Button type="submit">{t("admin.generic.buttons.save")}</Button>
                </div>
            </form>
        </FormPopupModal>

        {/* Manage Stock Modal */}
        <FormPopupModal isOpen={isManageStockOpen} onClose={() => setIsManageStockOpen(false)}>
            <h2 className="text-2xl font-semibold mb-4">{t("admin.generic.modals.manageStock.title")}</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b">
                {["add", "return", "garbage"].map((tab) => (

                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as "add" | "return")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-primary"
                            }`}
                    >
                        {t(`admin.generic.modals.manageStock.tabs.${tab}`)}
                    </button>
                ))}
            </div>

            {/* Search Field */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                    placeholder={t("admin.generic.modals.manageStock.searchPlaceholder")}
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Product List */}
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {searchedProducts.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">
                        {t("admin.generic.modals.manageStock.noProductsFound")}
                    </p>
                )}
                {searchedProducts.map((product) => (
                    <div key={product.id} className="border rounded-md p-4 shadow-sm hover:bg-gray-50 transition">
                        <div className="flex justify-between items-center mb-3">
                            <p className="font-semibold">{product.name}</p>
                            <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                                {t("admin.generic.modals.manageStock.productStock")}: {product.stock}
                            </Badge>
                        </div>
                        <form onSubmit={(e) => handleStockSubmit(e, activeTab, product)} className="flex gap-2">
                            <Input
                                type="number"
                                name="quantity"
                                placeholder={
                                    activeTab === "add"
                                        ? t("admin.generic.modals.manageStock.quantityPlaceholderAdd")
                                        : t("admin.generic.modals.manageStock.quantityPlaceholderReturn")
                                }
                                min="1"
                                className="w-32"
                            />
                            <Button
                                type="submit"
                                variant={
                                    activeTab === "add"
                                        ? "default"
                                        : activeTab === "garbage"
                                            ? "destructive"
                                            : "outline"
                                }
                            >
                                {activeTab === "add"
                                    ? t("admin.generic.buttons.add")
                                    : activeTab === "return"
                                        ? t("admin.generic.buttons.return")
                                        : t("admin.generic.buttons.garbage")}
                            </Button>
                        </form>
                    </div>
                ))}
            </div>
        </FormPopupModal>
    </div>
    );
}
