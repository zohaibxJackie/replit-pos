// Future notes - when the user returns the stock a reciept should be created
// ref - first meeting 22:00
// Different between return stock and wastage product
/*
return stock means return the stock to the person from which we have bought
and wastage means the product is damaged and that person don't want to take it back
and it's not our use, so we move it to the wastage

The product should be connected to vendor as well, so if someone return the stock, we would know
from which vendor we bought the phone
*/

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Boxes, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from '@/context/TitleContext';
import { MobileProductForm, MobileProductPayload } from "@/components/MobileProductForm";


import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface Products {
  id: number;
  name: string;
  imeiOrSerial: string;
  stock: number;
  salePrice: number;
  store: string;
}

export default function Products() {
  useAuth("catalogProducts");
  const { toast } = useToast();
  const { t } = useTranslation();
  const {setTitle} = useTitle();
  useEffect(() => {
    setTitle(t("admin.products.title"));          
    return () => setTitle('Business Dashboard'); 
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isInterStockModalOpen, setIsInterStockModalOpen] = useState(false);
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", salePrice: 0 });
  const [stockSearch, setStockSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "return" | "wastage">("add");

  // Inter-Store Transfer
  const [imeiInput, setImeiInput] = useState("");
  const [matchedProduct, setMatchedProduct] = useState<any | null>(null);
  const [transferQty, setTransferQty] = useState<number>(0);
  const [targetStore, setTargetStore] = useState("store1");

  // Example product data (with store info)
  const [products, setProducts] = useState<Products[]>(
    Array.from({ length: 250 }, (_, i) => ({
      id: i + 1,
      name: "iPhone 12",
      imeiOrSerial: `SN1234${i}`,
      stock: i % 50,
      salePrice: 900 + i,
      store: "Main Store",
    }))
  );



  // Filtered data
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesName = !filters.name || p.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesImei = !filters.imeiOrSerial || p.imeiOrSerial.toLowerCase().includes(filters.imeiOrSerial.toLowerCase());
      const matchesStock =
        !filters.stock ||
        (filters.stock === "In Stock" && p.stock > 0) ||
        (filters.stock === "Out of Stock" && p.stock === 0);
      return matchesName && matchesImei && matchesStock;
    });
  }, [products, filters]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProducts.slice(start, start + limit);
  }, [filteredProducts, page, limit]);

  // Columns
  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { key: "name", label: t("admin.products.column.product_name"), filterType: "text" },
    { key: "imeiOrSerial", label: t("admin.products.column.imei"), filterType: "text" },
    {
      key: "stock",
      label: t("admin.products.column.stock"),
      filterType: "select",
      filterOptions: ["In Stock", "Out of Stock"],
      render: (value: number) => (
        <Badge variant={value <= 0 ? "destructive" : "default"}>{value}</Badge>
      ),
    },
    {
      key: "salePrice",
      label: t("admin.products.column.sale_price"),
      filterType: "none",
      render: (value: number) => `$${value}`,
    },
  ];

  // Handlers
  const openCreateModal = () => {
    setCurrentProduct(null);
    setFormData({ name: "", salePrice: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setCurrentProduct(product);
    setFormData({ name: product.name, salePrice: product.salePrice });
    setIsModalOpen(true);
  };


  const openManageStockModal = () => {
    setStockSearch("");
    setIsStockModalOpen(true);
  };

  const openInterStockModal = () => {
    setImeiInput("");
    setMatchedProduct(null);
    setTransferQty(0);
    setTargetStore("store1");
    setIsInterStockModalOpen(true);
  };

  const openPurchaseOrderModel = () => {
    setIsPurchaseOrderOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, salePrice } = formData;

    if (currentProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === currentProduct.id ? { ...p, name, salePrice } : p))
      );
      toast({ title: "Product Updated", description: `${name} has been updated.` });
    } else {
      const newProduct = {
        id: products.length + 1,
        name,
        imeiOrSerial: "",
        stock: 0,
        salePrice,
        store: "Main Store",
      };
      setProducts([...products, newProduct]);
      toast({ title: "Product Added", description: `${name} has been added.` });
    }

    setIsModalOpen(false);
  };

  const handleMobileProductSubmit = (payload: MobileProductPayload) => {
    // Create a new mobile product from the payload
    const newProduct = {
      id: products.length + 1,
      name: `${payload.brand} ${payload.model} ${payload.color}`,
      imeiOrSerial: payload.imei,
      stock: 1, // New mobile always starts with stock of 1
      salePrice: payload.sellingPrice,
      store: "Main Store",
    };
    
    setProducts([...products, newProduct]);
    
    toast({ 
      title: "Mobile Added Successfully", 
      description: `${newProduct.name} has been added to inventory.`,
    });

    console.log("Mobile Product Payload (API-ready):", payload);
    setIsModalOpen(false);
  };

  const handleStockSubmit = (
    e: React.FormEvent<HTMLFormElement>,
    action: "add" | "return" | "wastage",
    product: any
  ) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const quantity = parseInt((form.elements.namedItem("quantity") as HTMLInputElement).value);

    if (isNaN(quantity) || quantity <= 0) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== product.id) return p;

        if (action === "add") return { ...p, stock: p.stock + quantity };
        if (action === "return") return { ...p, stock: Math.max(0, p.stock - quantity) };
        if (action === "wastage") return { ...p, stock: Math.max(0, p.stock - quantity) };

        return p;
      })
    );

    let title = "";
    let description = "";

    if (action === "add") {
      title = "Stock Added";
      description = `${quantity} units added to ${product.name}`;
    } else if (action === "return") {
      title = "Stock Returned";
      description = `${quantity} units returned from ${product.name}`;
    } else {
      title = "Moved to Wastage";
      description = `${quantity} units of ${product.name} marked as wasted.`;
    }

    toast({ title, description });
  };


  // Filter inside Manage Stock modal
  const searchedProducts = useMemo(() => {
    if (!stockSearch.trim()) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
        p.imeiOrSerial.toLowerCase().includes(stockSearch.toLowerCase())
    );
  }, [products, stockSearch]);

  // Handle IMEI search inside Inter-Store Modal
  const handleImeiSearch = (value: string) => {
    setImeiInput(value);
    const found = products.find(
      (p) => p.imeiOrSerial.toLowerCase() === value.trim().toLowerCase()
    );
    setMatchedProduct(found || null);
  };

  const handleTransferSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!matchedProduct)
      return toast({ title: "Invalid IMEI", description: "No product found." });

    const qtyToSend = transferQty > 0 ? transferQty : matchedProduct.stock;
    if (qtyToSend > matchedProduct.stock)
      return toast({ title: "Error", description: "Not enough stock to transfer." });

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === matchedProduct.id)
          return { ...p, stock: p.stock - qtyToSend };
        return p;
      })
    );

    toast({
      title: "Stock Transferred",
      description: `${qtyToSend} units of ${matchedProduct.name} sent to ${targetStore}.`,
    });

    setIsInterStockModalOpen(false);
  };

  // Handle page size change (records per page)
  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when page size is changed
  };

  // Handle page change (pagination)
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">

        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={openCreateModal} data-testid="button-create-product">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("admin.products.create_new_product")}</span>
            <span className="sm:hidden">New Product</span>
          </Button>
          <Button variant="outline" onClick={openManageStockModal} data-testid="button-manage-stock">
            <Boxes className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t("admin.products.manage_stock")}</span>
            <span className="sm:hidden">Stock</span>
          </Button>
          <Button variant="outline" onClick={openInterStockModal} data-testid="button-inter-stock">
            <span className="hidden sm:inline">{t("admin.products.inter_stock_transfer")}</span>
            <span className="sm:hidden">Transfer</span>
          </Button>
          <Button variant="outline" onClick={openPurchaseOrderModel} data-testid="button-purchase-order">
            <span className="hidden sm:inline">Purchase Order</span>
            <span className="sm:hidden">PO</span>
          </Button>
        </div>
      </div>

      {/* Pagination and Records per Page Dropdown above table */}
      <div className="flex justify-end items-center mb-4">
        <TablePageSizeSelector
          limit={limit}
          onChange={handlePageSizeChange}
        />
      </div>

      {/* ✅ DataTable */}
      <DataTable
        columns={columns}
        data={paginatedProducts}
        showActions
        renderActions={(row) => (
          <div className="flex justify-end gap-1 relative z-10">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(row);
              }}
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
      {/* Pagination Controls Below Table */}
      <div className="mt-4">
        <TablePagination
          page={page}
          limit={limit}
          total={filteredProducts.length}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Product Modal */}
      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4">
          {currentProduct ? "Edit Product" : "Add New Mobile"}
        </h2>
        {currentProduct ? (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label>Sale Price (PKR)</Label>
              <Input
                name="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Product
              </Button>
            </div>
          </form>
        ) : (
          <MobileProductForm
            onSubmit={handleMobileProductSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        )}
      </FormPopupModal>

      {/* Manage Stock Modal */}
      <FormPopupModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)}>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Boxes className="w-5 h-5" /> Manage Stock
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          {["add", "return", "wastage"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "add" | "return" | "wastage")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-primary"
                }`}
            >
              {tab === "add"
                ? "Add Stock"
                : tab === "return"
                  ? "Return Stock"
                  : "Move to Wastage"}
            </button>
          ))}
        </div>  

        {/* Search Field */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search by Product Name or IMEI"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Search Results */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {searchedProducts.length === 0 && (
            <p className="text-center text-gray-500 text-sm">Please enter a valid query...</p>
          )}

          {searchedProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-md p-4 shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold">{product.name}</p>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  Stock: {product.stock}
                </Badge>
              </div>

              <form
                onSubmit={(e) => handleStockSubmit(e, activeTab, product)}
                className="flex flex-col gap-2"
              >
                <Input
                  type="number"
                  name="quantity"
                  placeholder={
                    activeTab === "add"
                      ? "Enter quantity to add"
                      : activeTab === "return"
                        ? "Enter quantity to return"
                        : "Enter quantity to mark as wastage"
                  }
                  min="1"
                />
                {activeTab !== "wastage" ? (<Textarea 
                  placeholder="Please enter the reason"
                
                />) : ""}
                <Button
                  type="submit"
                  variant={
                    activeTab === "add"
                      ? "default"
                      : activeTab === "return"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {activeTab === "add"
                    ? "Add"
                    : activeTab === "return"
                      ? "Return"
                      : "Move"}
                </Button>
              </form>
            </div>
          ))}
        </div>
      </FormPopupModal>


      {/* Inter-Stock Modal */}
      <FormPopupModal isOpen={isInterStockModalOpen} onClose={() => setIsInterStockModalOpen(false)}>
        <h2 className="text-2xl font-semibold">Inter-Store Stock Movement</h2>

        <form onSubmit={handleTransferSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Enter IMEI or Serial Number</Label>
            <Input
              type="text"
              value={imeiInput}
              onChange={(e) => handleImeiSearch(e.target.value)}
              placeholder="Enter IMEI or Serial Number"
              required
            />
          </div>

          {/* Matched Product */}
          {matchedProduct ? (
            <div className="border p-3 rounded-md">
              <p className="font-medium">{matchedProduct.name}</p>
              <p className="text-sm text-gray-500">Current Stock: {matchedProduct.stock}</p>
              <div className="mt-3 flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={matchedProduct.stock}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  placeholder="Enter quantity"
                  className="w-32"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTransferQty(matchedProduct.stock)}
                >
                  Send All
                </Button>
              </div>
            </div>
          ) : imeiInput ? (
            <p className="text-red-500 text-sm">No product found for this IMEI</p>
          ) : null}

          {/* Store dropdown using ShadCN Select */}
          <div>
            <Label>Send Stock To</Label>
            <Select value={targetStore} onValueChange={setTargetStore}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store1">Store 1</SelectItem>
                <SelectItem value="store2">Store 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsInterStockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!matchedProduct}>
              Transfer Stock
            </Button>
          </div>
        </form>
      </FormPopupModal>

      <FormPopupModal isOpen={isPurchaseOrderOpen} onClose={() => setIsPurchaseOrderOpen(false)}>
          <h2>Create new purchase order</h2>
          <form>
            
          </form>
      </FormPopupModal>
    </div>
  );
}