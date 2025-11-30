import { useState, useMemo, useEffect } from "react";
import { TrendingUp, Download, Calendar } from "lucide-react";
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

export default function TopMobileSalesReport() {
  useAuth("adminReportsTopMobileSales");
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Top Mobile Sales Report");
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
  const topMobiles = useMemo(
    () =>
      [
        { rank: 1, model: "iPhone 15 Pro Max", brand: "Apple", unitsSold: 145, revenue: 159500, profit: 21750 },
        { rank: 2, model: "Samsung Galaxy S24 Ultra", brand: "Samsung", unitsSold: 132, revenue: 118800, profit: 19800 },
        { rank: 3, model: "iPhone 15 Pro", brand: "Apple", unitsSold: 128, revenue: 128000, profit: 19200 },
        { rank: 4, model: "Samsung Galaxy S24+", brand: "Samsung", unitsSold: 98, revenue: 83300, profit: 14700 },
        { rank: 5, model: "iPhone 15", brand: "Apple", unitsSold: 92, revenue: 73600, profit: 13800 },
        { rank: 6, model: "Xiaomi 14 Pro", brand: "Xiaomi", unitsSold: 87, revenue: 52200, profit: 13050 },
        { rank: 7, model: "Google Pixel 8 Pro", brand: "Google", unitsSold: 76, revenue: 60800, profit: 11400 },
        { rank: 8, model: "OnePlus 12", brand: "OnePlus", unitsSold: 71, revenue: 49700, profit: 10650 },
        { rank: 9, model: "Samsung Galaxy A54", brand: "Samsung", unitsSold: 68, revenue: 27200, profit: 10200 },
        { rank: 10, model: "iPhone 14", brand: "Apple", unitsSold: 63, revenue: 44100, profit: 9450 },
        { rank: 11, model: "Xiaomi 13T", brand: "Xiaomi", unitsSold: 59, revenue: 29500, profit: 8850 },
        { rank: 12, model: "Google Pixel 8", brand: "Google", unitsSold: 54, revenue: 37800, profit: 8100 },
        { rank: 13, model: "OPPO Find X6 Pro", brand: "OPPO", unitsSold: 51, revenue: 40800, profit: 7650 },
        { rank: 14, model: "Vivo X100", brand: "Vivo", unitsSold: 47, revenue: 32900, profit: 7050 },
        { rank: 15, model: "Realme GT 5", brand: "Realme", unitsSold: 43, revenue: 21500, profit: 6450 },
      ],
    []
  );

  const chartData = useMemo(() => {
    return topMobiles.slice(0, 10);
  }, [topMobiles]);

  const summary = useMemo(() => {
    const totalUnits = topMobiles.reduce((sum, item) => sum + item.unitsSold, 0);
    const totalRevenue = topMobiles.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = topMobiles.reduce((sum, item) => sum + item.profit, 0);
    const topBrand = "Apple";

    return { totalUnits, totalRevenue, totalProfit, topBrand };
  }, [topMobiles]);

  const columns = [
    { key: "rank", label: "Rank", filterType: "none" },
    { key: "model", label: "Model", filterType: "text" },
    { key: "brand", label: "Brand", filterType: "select", filterOptions: ["Apple", "Samsung", "Xiaomi", "Google", "OnePlus", "OPPO", "Vivo", "Realme"] },
    { key: "unitsSold", label: "Units Sold", filterType: "none" },
    { 
      key: "revenue", 
      label: "Revenue (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toLocaleString()}`
    },
    { 
      key: "profit", 
      label: "Profit (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toLocaleString()}`
    },
  ];

  const filteredData = useMemo(() => {
    return topMobiles.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [topMobiles, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["Rank", "Model", "Brand", "Units Sold", "Revenue", "Profit"].join(","),
      ...filteredData.map((s) =>
        [s.rank, s.model, s.brand, s.unitsSold, s.revenue, s.profit].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "top_mobile_sales_report.csv";
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Units Sold</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalUnits}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Profit</p>
          <p className="text-xl font-semibold text-green-600">€{summary.totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Top Brand</p>
          <p className="text-xl font-semibold text-blue-600">{summary.topBrand}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Mobile Sales</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="model" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="unitsSold" fill="#8884d8" name="Units Sold" />
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
