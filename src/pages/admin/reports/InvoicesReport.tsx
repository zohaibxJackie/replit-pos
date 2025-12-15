import { useState, useMemo, useEffect } from "react";
import { FileText, Download, Calendar } from "lucide-react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { format as formatDate } from "date-fns";
import { useCurrency } from "@/utils/currency";
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

export default function InvoicesReport() {
  useAuth("adminReportsInvoices");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { format, symbol } = useCurrency();

  useEffect(() => {
    setTitle("Invoices Report");
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
  const invoicesData = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        invoiceNumber: `INV-${2025}${String(i + 1).padStart(4, '0')}`,
        date: `2025-10-${(i % 25) + 1}`,
        customer: `Customer ${(i % 10) + 1}`,
        amount: 500 + i * 50,
        tax: (500 + i * 50) * 0.21,
        total: (500 + i * 50) * 1.21,
        status: ["Paid", "Pending", "Overdue"][i % 3],
        paymentMethod: ["Card", "Cash", "Bank Transfer"][i % 3],
      })),
    []
  );

  const chartData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    invoicesData.forEach(item => {
      if (!statusCount[item.status]) {
        statusCount[item.status] = 0;
      }
      statusCount[item.status]++;
    });

    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [invoicesData]);

  const summary = useMemo(() => {
    const totalInvoices = invoicesData.length;
    const totalAmount = invoicesData.reduce((sum, item) => sum + item.total, 0);
    const paidInvoices = invoicesData.filter(item => item.status === "Paid").length;
    const pendingAmount = invoicesData
      .filter(item => item.status !== "Paid")
      .reduce((sum, item) => sum + item.total, 0);

    return { totalInvoices, totalAmount, paidInvoices, pendingAmount };
  }, [invoicesData]);

  const columns = [
    { key: "invoiceNumber", label: "Invoice #", filterType: "text" as const },
    { key: "date", label: "Date", filterType: "none" as const },
    { key: "customer", label: "Customer", filterType: "text" as const },
    { 
      key: "amount", 
      label: `Amount (${symbol})`, 
      filterType: "none" as const,
      render: (value: number) => format(value)
    },
    { 
      key: "tax", 
      label: `Tax (${symbol})`, 
      filterType: "none" as const,
      render: (value: number) => format(value)
    },
    { 
      key: "total", 
      label: `Total (${symbol})`, 
      filterType: "none" as const,
      render: (value: number) => format(value)
    },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: ["Paid", "Pending", "Overdue"],
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === "Paid" ? "bg-green-100 text-green-700" :
          value === "Pending" ? "bg-yellow-100 text-yellow-700" :
          "bg-red-100 text-red-700"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "paymentMethod", label: "Payment Method", filterType: "select", filterOptions: ["Card", "Cash", "Bank Transfer"] },
  ];

  const filteredData = useMemo(() => {
    return invoicesData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [invoicesData, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["Invoice #", "Date", "Customer", "Amount", "Tax", "Total", "Status", "Payment Method"].join(","),
      ...filteredData.map((s) =>
        [s.invoiceNumber, s.date, s.customer, s.amount, s.tax, s.total, s.status, s.paymentMethod].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invoices_report.csv";
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Invoices</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalInvoices}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Amount</p>
          <p className="text-xl font-semibold text-gray-900">{format(summary.totalAmount)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Paid Invoices</p>
          <p className="text-xl font-semibold text-green-600">{summary.paidInvoices}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Pending Amount</p>
          <p className="text-xl font-semibold text-red-600">{format(summary.pendingAmount)}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Invoices by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Count" />
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
