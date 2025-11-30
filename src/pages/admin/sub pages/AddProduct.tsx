import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useTitle } from "@/context/TitleContext";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

/* --- mock data --- */
const mockCategories = [
  {
    id: "phones",
    name: "Phones",
    children: [
      {
        id: "apple",
        name: "Apple",
        children: [{ id: "iphone", name: "iPhone" }, { id: "ipad", name: "iPad" }],
      },
      { id: "samsung", name: "Samsung" },
    ],
  },
  { id: "accessories", name: "Accessories" },
];

const mockProviders = [
  { id: "prov1", name: "Provider 1" },
  { id: "prov2", name: "Provider 2" },
];
const mockCustomers = [
  { id: "cust1", name: "Customer 1" },
  { id: "cust2", name: "Customer 2" },
];

/* --- helpers --- */
function useSalePrice(price: string, margin: string, marginType: "percent" | "fixed") {
  return useMemo(() => {
    const p = parseFloat(price) || 0;
    const m = parseFloat(margin) || 0;
    if (marginType === "percent") return (p + (p * m) / 100).toFixed(2);
    return (p + m).toFixed(2);
  }, [price, margin, marginType]);
}
function applyTax(salePrice: string, taxId?: string) {
  const price = parseFloat(salePrice) || 0;
  if (!taxId) return price;

  const tax = mockTaxes.find((t) => t.id === taxId);
  if (!tax || tax.value === 0) return price;

  // reduce tax percentage from price
  const discounted = price - (price * tax.value) / 100;
  return Number(discounted.toFixed(2));
}


/* --- SearchableSelect: memoized to avoid remounts --- */
const SearchableSelect = React.memo(function SearchableSelect({
  items,
  placeholder,
  value,
  onChange,
  labelKey = "name",
}: {
  items: { id: string;[k: string]: any }[];
  placeholder?: string;
  value?: string | undefined;
  onChange: (v: string) => void;
  labelKey?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      items.filter((it) =>
        String(it[labelKey] ?? "").toLowerCase().includes(query.toLowerCase())
      ),
    [items, query, labelKey]
  );

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        onChange(v);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        <div className="p-3">
          <Input
            placeholder={`Search ${placeholder ?? ""}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="max-h-44 overflow-auto">
          {filtered.map((it) => (
            <SelectItem key={it.id} value={it.id}>
              {it[labelKey]}
            </SelectItem>
          ))}
          <SelectItem 
          value="add_new"
          >
            <span className="flex gap-2 items-center">
              <Plus className="w-4" />
              Add New
            </span>
          </SelectItem>
        </div>
      </SelectContent>
    </Select>
  );
});

/* --- Row --- */
const Row = React.memo(function Row({
  label,
  children,
  stackOnMobile = false, // only stack when true
}: {
  label: string;
  children: React.ReactNode;
  stackOnMobile?: boolean;
}) {
  const base = stackOnMobile
    ? "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-gray-200"
    : "flex items-center justify-between gap-4 py-3 border-b border-gray-200";

  return (
    <div className={base}>
      <div className=" min-w-[3rem] text-sm text-gray-700 font-medium">{label}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
});

/* --- Mock Tax Data --- */
const mockTaxes = [
  { id: "no_tax", name: "No Tax", value: 0 },
  { id: "tax5", name: "5% Tax", value: 5 },
  { id: "tax10", name: "10% Tax", value: 10 },
  { id: "tax15", name: "15% Tax", value: 15 },
];


/* --- main component --- */
export default function AddProduct() {
  useAuth("catalogAddProduct");
  const { setTitle } = useTitle();
  const [, setLocation] = useLocation();
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Tax states
  const [newTax, setNewTax] = useState<string | undefined>(undefined);
  const [usedTax, setUsedTax] = useState<string | undefined>(undefined);


  // UI state
  const [isUsed, setIsUsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // New product
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState<string | undefined>(undefined);
  const [newPrice, setNewPrice] = useState("");
  const [newMargin, setNewMargin] = useState("");
  const [newMarginType, setNewMarginType] = useState<"percent" | "fixed">("percent");
  const [newQuantity, setNewQuantity] = useState<number | "">(1);

  // Used product
  const [usedName, setUsedName] = useState("");
  const [usedCustomer, setUsedCustomer] = useState<string | undefined>(undefined);
  const [usedPrice, setUsedPrice] = useState("");
  const [usedMargin, setUsedMargin] = useState("");
  const [usedMarginType, setUsedMarginType] = useState<"percent" | "fixed">("percent");

  // Categories (3 levels)
  const [categories] = useState(mockCategories);
  const [catLevel1, setCatLevel1] = useState<string | undefined>(undefined);
  const [catLevel2, setCatLevel2] = useState<string | undefined>(undefined);
  const [catLevel3, setCatLevel3] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTitle("Add Product");
    return () => setTitle("Business Dashboard");
  }, [setTitle]);

  const baseNewSalePrice = useSalePrice(newPrice, newMargin, newMarginType);
  const baseUsedSalePrice = useSalePrice(usedPrice, usedMargin, usedMarginType);

  const newSalePrice = useMemo(() => applyTax(baseNewSalePrice, newTax), [baseNewSalePrice, newTax]);
  const usedSalePrice = useMemo(() => applyTax(baseUsedSalePrice, usedTax), [baseUsedSalePrice, usedTax]);


  const level1Options = categories;
  const level2Options = useMemo(() => {
    const found = categories.find((c) => c.id === catLevel1);
    return found?.children ?? [];
  }, [categories, catLevel1]);
  const level3Options = useMemo(() => {
    const found = level2Options.find((c) => c.id === catLevel2);
    return found?.children ?? [];
  }, [level2Options, catLevel2]);

  /* --- stable callbacks --- */
  const onNewProviderChange = useCallback(
    (v: string) => {
      if (v === "add_new") setLocation("/admin/providers");
      else setNewProvider(v);
    },
    [setLocation]
  );

  const onUsedCustomerChange = useCallback(
    (v: string) => {
      if (v === "add_new") setLocation("/admin/customers/add");
      else setUsedCustomer(v);
    },
    [setLocation]
  );

  const onCatLevel1Change = useCallback(
    (v: string) => {
      if (v === "add_new") {
        setLocation("/catalog/categories");
        return;
      }
      setCatLevel1(v);
      setCatLevel2(undefined);
      setCatLevel3(undefined);
    },
    [setLocation]
  );

  const onCatLevel2Change = useCallback(
    (v: string) => {
      if (v === "add_new") {
        setLocation("/catalog/categories");
        return;
      }
      setCatLevel2(v);
      setCatLevel3(undefined);
    },
    [setLocation]
  );

  const onCatLevel3Change = useCallback(
    (v: string) => {
      if (v === "add_new") {
        setLocation("/catalog/categories");
        return;
      }
      setCatLevel3(v);
    },
    [setLocation]
  );

  /* --- submit handlers (mock) --- */
  const submitNew = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!newName.trim()) newErrors.newName = "Product name is required";
      if (!newProvider) newErrors.newProvider = "Provider is required";
      if (!newPrice) newErrors.newPrice = "Price is required";
      if (!newMargin) newErrors.newMargin = "Margin is required";
      if (!newQuantity) newErrors.newQuantity = "Quantity is required";
      if (!catLevel1) newErrors.category = "Category is required";

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return; // stop if errors exist

      const payload = {
        name: newName,
        provider: newProvider,
        price: parseFloat(newPrice) || 0,
        margin: parseFloat(newMargin) || 0,
        marginType: newMarginType,
        salePrice: newSalePrice || 0,
        quantity: Number(newQuantity) || 1,
        category: { level1: catLevel1, level2: catLevel2, level3: catLevel3 },
        tax: newTax,
      };
      console.log("submitNew", payload);
      alert("New product payload printed to console");
    },
    [
      newName,
      newProvider,
      newPrice,
      newMargin,
      newMarginType,
      newSalePrice,
      newQuantity,
      catLevel1,
      catLevel2,
      catLevel3,
    ]
  );

  const submitUsed = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!usedName.trim()) newErrors.usedName = "Product name is required";
      if (!usedCustomer) newErrors.usedCustomer = "Customer is required";
      if (!usedPrice) newErrors.usedPrice = "Price is required";
      if (!usedMargin) newErrors.usedMargin = "Margin is required";
      if (!catLevel1) newErrors.category = "Category is required";

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      const payload = {
        name: usedName,
        customer: usedCustomer,
        price: parseFloat(usedPrice) || 0,
        margin: parseFloat(usedMargin) || 0,
        marginType: usedMarginType,
        salePrice: usedSalePrice || 0,
        quantity: 1,
        category: { level1: catLevel1, level2: catLevel2, level3: catLevel3 },
        tax: usedTax,
      };
      console.log("submitUsed", payload);
      alert("Used product payload printed to console");
    },
    [
      usedName,
      usedCustomer,
      usedPrice,
      usedMargin,
      usedMarginType,
      usedSalePrice,
      catLevel1,
      catLevel2,
      catLevel3,
    ]
  );

  /* --- category levels (dynamic array) --- */
  const categoryLevels = [
    { options: level1Options, value: catLevel1, onChange: onCatLevel1Change, placeholder: "Level 1" },
    { options: level2Options, value: catLevel2, onChange: onCatLevel2Change, placeholder: "Level 2" },
    { options: level3Options, value: catLevel3, onChange: onCatLevel3Change, placeholder: "Level 3" },
  ];

  const CategoryRow = (
    <div className="flex flex-col sm:flex-row gap-3">
      {categoryLevels.map((lvl, idx) => {
        const show = lvl.options && lvl.options.length > 0;
        if (!show) return null;
        return (
          <div key={idx} className="sm:w-64 mt-3 sm:mt-0 !w-auto">
            <SearchableSelect
              items={lvl.options}
              placeholder={lvl.placeholder}
              value={lvl.value}
              onChange={lvl.onChange}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="h-full min-h-0 overflow-auto">
        <div className="mb-4 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <button className="text-sm underline text-gray-600" onClick={() => setShowHelp((s) => !s)}>
              Need help?
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mb-6 p-4 rounded border border-gray-200 bg-white/60">
            <p className="text-sm text-gray-700">
              Quick help: fill product name, choose category (up to three levels). For used phones choose the 'Used phone' toggle below. Price and margin determine the sale price.
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isUsed} onChange={(e) => setIsUsed(e.target.checked)} />
            <span className="text-sm font-medium">Used phone?</span>
          </label>
        </div>

        <div className="rounded-md overflow-hidden border border-gray-100 bg-transparent shadow-sm min-h-0">
          {!isUsed ? (
            <form onSubmit={submitNew}>
              <div className="px-6 py-4">
                <h2 className="text-lg font-medium mb-3">Add New Mobile</h2>

                <Row label="Name">
                  <div>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter product name"
                    />
                    {errors.newName && (
                      <p className="text-red-500 text-xs mt-1">{errors.newName}</p>
                    )}
                  </div>
                </Row>

                {/* pass stackOnMobile so Category only stacks on small screens */}
                <Row label="Category" stackOnMobile>
                  <div>
                    {CategoryRow}
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>
                </Row>


                <Row label="Provider">
                  <div className="w-full sm:w-80">
                    <SearchableSelect
                      items={mockProviders}
                      placeholder="Select provider"
                      value={newProvider}
                      onChange={onNewProviderChange}
                    />
                    {errors.newProvider && (
                      <p className="text-red-500 text-xs mt-1">{errors.newProvider}</p>
                    )}
                  </div>
                </Row>


                <Row label="Price">
                  <div className="w-full sm:w-64">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      autoComplete="off"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Cost price"
                    />
                    {errors.newPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.newPrice}</p>
                    )}
                  </div>
                </Row>


                <Row label="Quantity">
                  <div className="w-full sm:w-40">
                    <Input
                      type="number"
                      min={1}
                      value={String(newQuantity)}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") setNewQuantity("");
                        else setNewQuantity(Math.max(1, parseInt(v || "0", 10)));
                      }}
                    />
                  </div>
                </Row>

                <Row label="Margin">
                  <div className="flex flex-col xl:flex-row gap-3 items-center">
                    <div className="w-44">
                      <Select
                        onValueChange={(v) => setNewMarginType(v as "percent" | "fixed")}
                        value={newMarginType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-44">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        autoComplete="off"
                        value={newMargin}
                        onChange={(e) => setNewMargin(e.target.value)}
                        placeholder="Value"
                      />
                      {errors.newMargin && (
                        <p className="text-red-500 text-xs mt-1">{errors.newMargin}</p>
                      )}
                    </div>
                  </div>
                </Row>

                <Row label="Tax">
                  <div className="w-full sm:w-80">
                    <SearchableSelect
                      items={mockTaxes}
                      placeholder="Select tax"
                      value={newTax}
                      onChange={setNewTax}
                    />
                    {errors.newTax && (
                      <p className="text-red-500 text-xs mt-1">{errors.newTax}</p>
                    )}
                  </div>
                </Row>

                <Row label="Sale price">
                  <div className="w-full sm:w-48">
                    <Input readOnly value={newSalePrice} />
                  </div>
                </Row>

                <div className="mt-6 flex gap-3 justify-end">
                  <Button type="submit">Add Product</Button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={submitUsed}>
              <div className="px-6 py-4">
                <h2 className="text-lg font-medium mb-3">Add Used Mobile</h2>

                <Row label="Name">
                  <div>
                    <Input
                      value={usedName}
                      onChange={(e) => setUsedName(e.target.value)}
                      placeholder="Enter product name"
                    />
                    {errors.usedName && (
                      <p className="text-red-500 text-xs mt-1">{errors.usedName}</p>
                    )}
                  </div>
                </Row>


                <Row label="Category" stackOnMobile>
                  <div>
                    {CategoryRow}
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>
                </Row>


                <Row label="Customer">
                  <div className="w-full sm:w-80">
                    <SearchableSelect
                      items={mockCustomers}
                      placeholder="Select customer"
                      value={usedCustomer}
                      onChange={onUsedCustomerChange}
                    />
                    {errors.usedCustomer && (
                      <p className="text-red-500 text-xs mt-1">{errors.usedCustomer}</p>
                    )}
                  </div>
                </Row>


                <Row label="Price">
                  <div className="w-full sm:w-64">
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      autoComplete="off"
                      value={usedPrice}
                      onChange={(e) => setUsedPrice(e.target.value)}
                      placeholder="Cost price"
                    />
                    {errors.usedPrice && (
                      <p className="text-red-500 text-xs mt-1">{errors.usedPrice}</p>
                    )}
                  </div>
                </Row>


                <Row label="Margin">
                  <div className="flex gap-3 items-center">
                    <div className="w-44">
                      <Select
                        onValueChange={(v) => setUsedMarginType(v as "percent" | "fixed")}
                        value={usedMarginType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-44">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        autoComplete="off"
                        value={usedMargin}
                        onChange={(e) => setUsedMargin(e.target.value)}
                        placeholder="Value"
                      />
                      {errors.usedMargin && (
                        <p className="text-red-500 text-xs mt-1">{errors.usedMargin}</p>
                      )}
                    </div>
                  </div>
                </Row>

                <Row label="Tax">
                  <div className="w-full sm:w-80">
                    <SearchableSelect
                      items={mockTaxes}
                      placeholder="Select tax"
                      value={usedTax}
                      onChange={setUsedTax}
                    />
                    {errors.usedTax && (
                      <p className="text-red-500 text-xs mt-1">{errors.usedTax}</p>
                    )}
                  </div>
                </Row>


                <Row label="Sale price">
                  <div className="w-full sm:w-48">
                    <Input readOnly value={usedSalePrice} />
                  </div>
                </Row>

                <Row label="Quantity">
                  <Input readOnly value={"1"} />
                </Row>

                <div className="mt-6 flex gap-3 justify-end">
                  <Button type="submit">Add Used Product</Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
