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
  LineChart,
  Line,
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

export default function StockSoldReport() {
  useAuth('admin');
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Stock Sold Report");
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
  const soldData = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        date: `2025-10-${(i % 25) + 1}`,
        product: i % 2 === 0 ? "iPhone 15" : "Galaxy S24",
        category: "Mobile",
        quantitySold: Math.floor(Math.random() * 10) + 1,
        revenue: (i % 2 === 0 ? 1100 : 950) * (Math.floor(Math.random() * 10) + 1),
        profit: (i % 2 === 0 ? 200 : 200) * (Math.floor(Math.random() * 10) + 1),
      })),
    []
  );

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; quantity: number; revenue: number }> = {};
    
    soldData.forEach(item => {
      if (!dailyData[item.date]) {
        dailyData[item.date] = { date: item.date, quantity: 0, revenue: 0 };
      }
      dailyData[item.date].quantity += item.quantitySold;
      dailyData[item.date].revenue += item.revenue;
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 15);
  }, [soldData]);

  const summary = useMemo(() => {
    const totalQuantity = soldData.reduce((sum, item) => sum + item.quantitySold, 0);
    const totalRevenue = soldData.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = soldData.reduce((sum, item) => sum + item.profit, 0);
    const avgDailySales = totalQuantity / 25;

    return { totalQuantity, totalRevenue, totalProfit, avgDailySales };
  }, [soldData]);

  const columns = [
    { key: "date", label: "Date", filterType: "none" },
    { key: "product", label: "Product Name", filterType: "text" },
    { key: "category", label: "Category", filterType: "select", filterOptions: ["Mobile", "Accessories"] },
    { key: "quantitySold", label: "Quantity Sold", filterType: "none" },
    { 
      key: "revenue", 
      label: "Revenue (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toFixed(2)}`
    },
    { 
      key: "profit", 
      label: "Profit (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toFixed(2)}`
    },
  ];

  const filteredData = useMemo(() => {
    return soldData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [soldData, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["Date", "Product Name", "Category", "Quantity Sold", "Revenue", "Profit"].join(","),
      ...filteredData.map((s) =>
        [s.date, s.product, s.category, s.quantitySold, s.revenue, s.profit].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stock_sold_report.csv";
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
          <p className="text-sm font-medium text-gray-500">Total Quantity Sold</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalQuantity}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Profit</p>
          <p className="text-xl font-semibold text-green-600">€{summary.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Avg Daily Sales</p>
          <p className="text-xl font-semibold text-gray-900">{summary.avgDailySales.toFixed(1)}</p>
        </div>
      </div>

      {/* Line Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="quantity" stroke="#8884d8" name="Quantity Sold" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (€)" />
          </LineChart>
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
