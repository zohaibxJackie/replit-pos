import { useState, useMemo, useEffect } from "react";
import { RotateCcw, Download, Calendar } from "lucide-react";
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

export default function SaleReturnReport() {
  useAuth('admin');
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Sale Return Report");
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
  const returnData = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        returnNumber: `RET-${2025}${String(i + 1).padStart(4, '0')}`,
        originalSale: `#00${i + 100}`,
        date: `2025-10-${(i % 25) + 1}`,
        customer: `Customer ${(i % 10) + 1}`,
        product: i % 2 === 0 ? "iPhone 15" : "Galaxy S24",
        quantity: 1,
        amount: i % 2 === 0 ? 1100 : 950,
        reason: ["Defective", "Customer Changed Mind", "Wrong Item", "Not as Described"][i % 4],
        status: ["Processed", "Pending", "Approved"][i % 3],
        refundMethod: ["Original Payment", "Store Credit", "Cash"][i % 3],
      })),
    []
  );

  const chartData = useMemo(() => {
    const dailyReturns: Record<string, { date: string; count: number; amount: number }> = {};
    
    returnData.forEach(item => {
      if (!dailyReturns[item.date]) {
        dailyReturns[item.date] = { date: item.date, count: 0, amount: 0 };
      }
      dailyReturns[item.date].count++;
      dailyReturns[item.date].amount += item.amount;
    });

    return Object.values(dailyReturns).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 15);
  }, [returnData]);

  const summary = useMemo(() => {
    const totalReturns = returnData.length;
    const totalAmount = returnData.reduce((sum, item) => sum + item.amount, 0);
    const processedReturns = returnData.filter(item => item.status === "Processed").length;
    const pendingReturns = returnData.filter(item => item.status === "Pending").length;

    return { totalReturns, totalAmount, processedReturns, pendingReturns };
  }, [returnData]);

  const columns = [
    { key: "returnNumber", label: "Return #", filterType: "text" },
    { key: "originalSale", label: "Original Sale", filterType: "text" },
    { key: "date", label: "Return Date", filterType: "none" },
    { key: "customer", label: "Customer", filterType: "text" },
    { key: "product", label: "Product", filterType: "text" },
    { key: "quantity", label: "Qty", filterType: "none" },
    { 
      key: "amount", 
      label: "Amount (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toFixed(2)}`
    },
    { 
      key: "reason", 
      label: "Reason", 
      filterType: "select", 
      filterOptions: ["Defective", "Customer Changed Mind", "Wrong Item", "Not as Described"] 
    },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: ["Processed", "Pending", "Approved"],
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === "Processed" ? "bg-green-100 text-green-700" :
          value === "Approved" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "refundMethod", label: "Refund Method", filterType: "select", filterOptions: ["Original Payment", "Store Credit", "Cash"] },
  ];

  const filteredData = useMemo(() => {
    return returnData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [returnData, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["Return #", "Original Sale", "Return Date", "Customer", "Product", "Quantity", "Amount", "Reason", "Status", "Refund Method"].join(","),
      ...filteredData.map((s) =>
        [s.returnNumber, s.originalSale, s.date, s.customer, s.product, s.quantity, s.amount, s.reason, s.status, s.refundMethod].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sale_return_report.csv";
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
          <p className="text-sm font-medium text-gray-500">Total Returns</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalReturns}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Amount</p>
          <p className="text-xl font-semibold text-red-600">€{summary.totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Processed</p>
          <p className="text-xl font-semibold text-green-600">{summary.processedReturns}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="text-xl font-semibold text-yellow-600">{summary.pendingReturns}</p>
        </div>
      </div>

      {/* Line Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Return Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#8884d8" name="Number of Returns" />
            <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#ff7c7c" name="Return Amount (€)" />
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
