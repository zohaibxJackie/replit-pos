import { useState, useMemo, useEffect } from "react";
import { DollarSign, Download, Calendar } from "lucide-react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function NetProfitReport() {
  useAuth("adminReportsNetProfit");
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Net Profit Report");
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
  const profitData = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        date: `2025-10-${(i % 25) + 1}`,
        revenue: 5000 + i * 500,
        cost: 3000 + i * 300,
        expenses: 500 + i * 20,
        grossProfit: (5000 + i * 500) - (3000 + i * 300),
        netProfit: (5000 + i * 500) - (3000 + i * 300) - (500 + i * 20),
        profitMargin: (((5000 + i * 500) - (3000 + i * 300) - (500 + i * 20)) / (5000 + i * 500) * 100).toFixed(2),
      })),
    []
  );

  const chartData = useMemo(() => {
    return profitData.slice(0, 15);
  }, [profitData]);

  const summary = useMemo(() => {
    const totalRevenue = profitData.reduce((sum, item) => sum + item.revenue, 0);
    const totalCost = profitData.reduce((sum, item) => sum + item.cost, 0);
    const totalExpenses = profitData.reduce((sum, item) => sum + item.expenses, 0);
    const totalGrossProfit = profitData.reduce((sum, item) => sum + item.grossProfit, 0);
    const totalNetProfit = profitData.reduce((sum, item) => sum + item.netProfit, 0);
    const avgProfitMargin = (totalNetProfit / totalRevenue * 100).toFixed(2);

    return { totalRevenue, totalCost, totalExpenses, totalGrossProfit, totalNetProfit, avgProfitMargin };
  }, [profitData]);

  const columns = [
    { key: "date", label: "Date", filterType: "none" },
    { 
      key: "revenue", 
      label: "Revenue (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toLocaleString()}`
    },
    { 
      key: "cost", 
      label: "Cost (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toLocaleString()}`
    },
    { 
      key: "expenses", 
      label: "Expenses (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toLocaleString()}`
    },
    { 
      key: "grossProfit", 
      label: "Gross Profit (€)", 
      filterType: "none",
      render: (value: number) => (
        <span className="font-semibold text-green-600">€{value.toLocaleString()}</span>
      )
    },
    { 
      key: "netProfit", 
      label: "Net Profit (€)", 
      filterType: "none",
      render: (value: number) => (
        <span className="font-semibold text-blue-600">€{value.toLocaleString()}</span>
      )
    },
    { 
      key: "profitMargin", 
      label: "Profit Margin (%)", 
      filterType: "none",
      render: (value: string) => `${value}%`
    },
  ];

  const filteredData = useMemo(() => {
    return profitData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [profitData, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["Date", "Revenue", "Cost", "Expenses", "Gross Profit", "Net Profit", "Profit Margin"].join(","),
      ...filteredData.map((s) =>
        [s.date, s.revenue, s.cost, s.expenses, s.grossProfit, s.netProfit, s.profitMargin].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "net_profit_report.csv";
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Cost</p>
          <p className="text-xl font-semibold text-red-600">€{summary.totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Expenses</p>
          <p className="text-xl font-semibold text-orange-600">€{summary.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Gross Profit</p>
          <p className="text-xl font-semibold text-green-600">€{summary.totalGrossProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Net Profit</p>
          <p className="text-xl font-semibold text-blue-600">€{summary.totalNetProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Avg Margin</p>
          <p className="text-xl font-semibold text-gray-900">{summary.avgProfitMargin}%</p>
        </div>
      </div>

      {/* Combined Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            <Bar dataKey="cost" fill="#ff7c7c" name="Cost" />
            <Line type="monotone" dataKey="netProfit" stroke="#00C49F" strokeWidth={3} name="Net Profit" />
          </ComposedChart>
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
