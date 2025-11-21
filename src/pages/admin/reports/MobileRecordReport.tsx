import { useState, useMemo, useEffect } from "react";
import { Smartphone, Download, Calendar } from "lucide-react";
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
  AreaChart,
  Area,
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

export default function MobileRecordReport() {
  useAuth('admin');
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Mobile Record Report");
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
  const mobileRecords = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        imei: `${352094}${String(10000000 + i).slice(1)}`,
        brand: ["Apple", "Samsung", "Xiaomi", "Google"][i % 4],
        model: ["iPhone 15", "Galaxy S24", "Xiaomi 14", "Pixel 8"][i % 4],
        purchaseDate: `2025-${String((i % 11) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        saleDate: i % 3 === 0 ? `2025-${String((i % 11) + 2).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}` : "-",
        purchasePrice: 600 + i * 30,
        salePrice: i % 3 === 0 ? 800 + i * 40 : 0,
        status: i % 3 === 0 ? "Sold" : "In Stock",
        supplier: `Supplier ${(i % 5) + 1}`,
      })),
    []
  );

  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; purchased: number; sold: number }> = {};
    
    mobileRecords.forEach(item => {
      const month = item.purchaseDate.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, purchased: 0, sold: 0 };
      }
      monthlyData[month].purchased++;
      if (item.status === "Sold") {
        monthlyData[month].sold++;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [mobileRecords]);

  const summary = useMemo(() => {
    const totalMobiles = mobileRecords.length;
    const soldMobiles = mobileRecords.filter(item => item.status === "Sold").length;
    const inStock = totalMobiles - soldMobiles;
    const totalPurchaseValue = mobileRecords.reduce((sum, item) => sum + item.purchasePrice, 0);
    const totalSaleValue = mobileRecords.reduce((sum, item) => sum + item.salePrice, 0);

    return { totalMobiles, soldMobiles, inStock, totalPurchaseValue, totalSaleValue };
  }, [mobileRecords]);

  const columns = [
    { key: "imei", label: "IMEI", filterType: "text" },
    { key: "brand", label: "Brand", filterType: "select", filterOptions: ["Apple", "Samsung", "Xiaomi", "Google"] },
    { key: "model", label: "Model", filterType: "text" },
    { key: "purchaseDate", label: "Purchase Date", filterType: "none" },
    { key: "saleDate", label: "Sale Date", filterType: "none" },
    { 
      key: "purchasePrice", 
      label: "Purchase Price (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toFixed(2)}`
    },
    { 
      key: "salePrice", 
      label: "Sale Price (€)", 
      filterType: "none",
      render: (value: number) => value > 0 ? `€${value.toFixed(2)}` : "-"
    },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: ["In Stock", "Sold"],
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === "Sold" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "supplier", label: "Supplier", filterType: "text" },
  ];

  const filteredData = useMemo(() => {
    return mobileRecords.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [mobileRecords, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["IMEI", "Brand", "Model", "Purchase Date", "Sale Date", "Purchase Price", "Sale Price", "Status", "Supplier"].join(","),
      ...filteredData.map((s) =>
        [s.imei, s.brand, s.model, s.purchaseDate, s.saleDate, s.purchasePrice, s.salePrice || "-", s.status, s.supplier].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mobile_record_report.csv";
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
          <p className="text-sm font-medium text-gray-500">Total Mobiles</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalMobiles}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Sold</p>
          <p className="text-xl font-semibold text-green-600">{summary.soldMobiles}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">In Stock</p>
          <p className="text-xl font-semibold text-blue-600">{summary.inStock}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Purchase Value</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalPurchaseValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Sale Value</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalSaleValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Area Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Purchases vs Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPurchased" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="purchased" stroke="#8884d8" fillOpacity={1} fill="url(#colorPurchased)" name="Purchased" />
            <Area type="monotone" dataKey="sold" stroke="#82ca9d" fillOpacity={1} fill="url(#colorSold)" name="Sold" />
          </AreaChart>
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
