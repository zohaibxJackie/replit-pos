import { useState, useMemo, useEffect } from "react";
import { Package, Download, Calendar } from "lucide-react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { TablePagination } from "@/components/ui/tablepagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from '@/context/TitleContext';
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function AvailableStockReport() {
  useAuth('admin');
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Available Stock Report");
    return () => setTitle('Business Dashboard');
  }, [setTitle]);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2025, 9, 1),
    to: new Date(2025, 9, 25),
  });

  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const minDate = new Date(2025, 9, 1);
  const maxDate = new Date(2025, 11, 15);

  // Mock Data
  const stockData = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        product: i % 3 === 0 ? "iPhone 15 Pro" : i % 3 === 1 ? "Samsung S24" : "Charger USB-C",
        category: i % 3 === 0 ? "Mobile" : i % 3 === 1 ? "Mobile" : "Accessories",
        sku: `SKU-${1000 + i}`,
        quantity: 50 - i,
        minStock: 10,
        buyPrice: i % 3 === 0 ? 900 : i % 3 === 1 ? 750 : 15,
        salePrice: i % 3 === 0 ? 1100 : i % 3 === 1 ? 950 : 25,
        status: (50 - i) > 10 ? "In Stock" : "Low Stock",
      })),
    []
  );

  const chartData = useMemo(() => {
    const productGroups: Record<string, number> = {};
    stockData.forEach(item => {
      if (!productGroups[item.product]) {
        productGroups[item.product] = 0;
      }
      productGroups[item.product] += item.quantity;
    });

    return Object.entries(productGroups)
      .slice(0, 10)
      .map(([name, quantity]) => ({ name, quantity }));
  }, [stockData]);

  const summary = useMemo(() => {
    const totalItems = stockData.length;
    const totalQuantity = stockData.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = stockData.filter(item => item.quantity <= item.minStock).length;
    const inStockItems = totalItems - lowStockItems;
    const totalValue = stockData.reduce((sum, item) => sum + (item.quantity * item.buyPrice), 0);

    return { totalItems, totalQuantity, lowStockItems, inStockItems, totalValue };
  }, [stockData]);

  const columns = [
    { key: "sku", label: "SKU", filterType: "text" },
    { key: "product", label: "Product Name", filterType: "text" },
    { key: "category", label: "Category", filterType: "select", filterOptions: ["Mobile", "Accessories"] },
    { key: "quantity", label: "Quantity", filterType: "none" },
    { key: "minStock", label: "Min Stock", filterType: "none" },
    { key: "buyPrice", label: "Buy Price (€)", filterType: "none" },
    { key: "salePrice", label: "Sale Price (€)", filterType: "none" },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: ["In Stock", "Low Stock"],
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === "In Stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {value}
        </span>
      ),
    },
  ];

  const filteredStock = useMemo(() => {
    return stockData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [stockData, filters]);

  const paginatedStock = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredStock.slice(start, start + recordsPerPage);
  }, [filteredStock, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["SKU", "Product Name", "Category", "Quantity", "Min Stock", "Buy Price", "Sale Price", "Status"].join(","),
      ...filteredStock.map((s) =>
        [s.sku, s.product, s.category, s.quantity, s.minStock, s.buyPrice, s.salePrice, s.status].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "available_stock_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 font-medium" data-testid="button-date-range">
              <Calendar className="w-4 h-4" />
              {dateRange?.from && dateRange?.to ? (
                <>
                  {format(new Date(dateRange.from), "MMM d, yyyy")} - {format(new Date(dateRange.to), "MMM d, yyyy")}
                </>
              ) : (
                "Select Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-3 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">From</label>
                <Input
                  className="!w-9/12 justify-center"
                  type="date"
                  value={dateRange.from ? dateRange.from.toISOString().split("T")[0] : ""}
                  min={minDate.toISOString().split("T")[0]}
                  max={maxDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      from: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  data-testid="input-date-from"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">To</label>
                <Input
                  className="!w-9/12 justify-center"
                  type="date"
                  value={dateRange.to ? dateRange.to.toISOString().split("T")[0] : ""}
                  min={minDate.toISOString().split("T")[0]}
                  max={maxDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      to: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  data-testid="input-date-to"
                />
              </div>
              <Button data-testid="button-apply-date">Apply</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Items</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Quantity</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalQuantity}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">In Stock</p>
          <p className="text-xl font-semibold text-green-600">{summary.inStockItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Low Stock</p>
          <p className="text-xl font-semibold text-red-600">{summary.lowStockItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Value</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stock by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#8884d8" name="Quantity" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table Controls */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <Select
          value={String(recordsPerPage)}
          onValueChange={(value) => {
            setRecordsPerPage(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]" data-testid="select-records-per-page">
            <SelectValue placeholder="Records per page" />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                Show {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleDownload} variant="default" data-testid="button-download">
          <Download className="w-4 h-4" /> Download
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedStock}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {/* Pagination */}
      <TablePagination
        page={page}
        limit={recordsPerPage}
        total={filteredStock.length}
        onPageChange={setPage}
      />
    </div>
  );
}
