import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Download } from "lucide-react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { format as formatDate } from "date-fns";
import { Calendar } from "lucide-react";
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

export default function MobileLowStockReport() {
  useAuth("adminReportsMobileLowStock");
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Mobile Low Stock Report");
    return () => setTitle('Business Dashboard');
  }, [setTitle]);

  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2025, 9, 1),
    to: new Date(2025, 9, 25),
  });

  const minDate = new Date(2025, 9, 1);
  const maxDate = new Date(2025, 11, 15);

  // Mock Data
  const lowStockMobiles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        sku: `MOB-${1000 + i}`,
        brand: ["Apple", "Samsung", "Xiaomi", "Google"][i % 4],
        model: ["iPhone 15", "Galaxy S24", "Xiaomi 14", "Pixel 8"][i % 4],
        currentStock: 5 - (i % 6),
        minStock: 10,
        reorderPoint: 15,
        status: (5 - (i % 6)) === 0 ? "Out of Stock" : (5 - (i % 6)) <= 3 ? "Critical" : "Low",
        lastRestockDate: `2025-${String((i % 11) + 1).padStart(2, '0')}-15`,
        supplier: `Supplier ${(i % 3) + 1}`,
      })),
    []
  );

  const chartData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    lowStockMobiles.forEach(item => {
      if (!statusCount[item.status]) {
        statusCount[item.status] = 0;
      }
      statusCount[item.status]++;
    });

    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [lowStockMobiles]);

  const summary = useMemo(() => {
    const totalItems = lowStockMobiles.length;
    const outOfStock = lowStockMobiles.filter(item => item.status === "Out of Stock").length;
    const critical = lowStockMobiles.filter(item => item.status === "Critical").length;
    const lowStock = lowStockMobiles.filter(item => item.status === "Low").length;

    return { totalItems, outOfStock, critical, lowStock };
  }, [lowStockMobiles]);

  const columns = [
    { key: "sku", label: "SKU", filterType: "text" },
    { key: "brand", label: "Brand", filterType: "select", filterOptions: ["Apple", "Samsung", "Xiaomi", "Google"] },
    { key: "model", label: "Model", filterType: "text" },
    { 
      key: "currentStock", 
      label: "Current Stock", 
      filterType: "none",
      render: (value: number) => (
        <span className={`font-semibold ${value === 0 ? 'text-red-600' : value <= 3 ? 'text-orange-600' : 'text-yellow-600'}`}>
          {value}
        </span>
      )
    },
    { key: "minStock", label: "Min Stock", filterType: "none" },
    { key: "reorderPoint", label: "Reorder Point", filterType: "none" },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: ["Out of Stock", "Critical", "Low"],
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === "Out of Stock" ? "bg-red-100 text-red-700" :
          value === "Critical" ? "bg-orange-100 text-orange-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "lastRestockDate", label: "Last Restock", filterType: "none" },
    { key: "supplier", label: "Supplier", filterType: "text" },
  ];

  const filteredData = useMemo(() => {
    return lowStockMobiles.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [lowStockMobiles, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["SKU", "Brand", "Model", "Current Stock", "Min Stock", "Reorder Point", "Status", "Last Restock", "Supplier"].join(","),
      ...filteredData.map((s) =>
        [s.sku, s.brand, s.model, s.currentStock, s.minStock, s.reorderPoint, s.status, s.lastRestockDate, s.supplier].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mobile_low_stock_report.csv";
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
                  {formatDate(new Date(dateRange.from), "MMM d, yyyy")} - {formatDate(new Date(dateRange.to), "MMM d, yyyy")}
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

      {/* Alert Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
          <p className="text-sm text-red-700">
            {summary.outOfStock} items out of stock, {summary.critical} items critical
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Low Stock Items</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Out of Stock</p>
          <p className="text-xl font-semibold text-red-600">{summary.outOfStock}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Critical</p>
          <p className="text-xl font-semibold text-orange-600">{summary.critical}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Low Stock</p>
          <p className="text-xl font-semibold text-yellow-600">{summary.lowStock}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stock Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#ff8042" name="Count" />
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
        data={paginatedData}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {/* Pagination */}
      <TablePagination
        page={page}
        limit={recordsPerPage}
        total={filteredData.length}
        onPageChange={setPage}
      />
    </div>
  );
}
