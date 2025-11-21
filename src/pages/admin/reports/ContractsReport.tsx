import { useState, useMemo, useEffect } from "react";
import { FileCheck, Download, Calendar } from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

export default function ContractsReport() {
  useAuth('admin');
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("Contracts Report");
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
  const contractsData = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        contractNumber: `CNT-${2025}${String(i + 1).padStart(4, '0')}`,
        customer: `Customer ${(i % 10) + 1}`,
        startDate: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`,
        endDate: `2026-${String((i % 12) + 1).padStart(2, '0')}-01`,
        value: 1000 + i * 200,
        status: ["Active", "Pending", "Expired", "Cancelled"][i % 4],
        type: ["Maintenance", "Service", "Support"][i % 3],
      })),
    []
  );

  const chartData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    contractsData.forEach(item => {
      if (!statusCount[item.status]) {
        statusCount[item.status] = 0;
      }
      statusCount[item.status]++;
    });

    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  }, [contractsData]);

  const summary = useMemo(() => {
    const totalContracts = contractsData.length;
    const activeContracts = contractsData.filter(item => item.status === "Active").length;
    const totalValue = contractsData.reduce((sum, item) => sum + item.value, 0);
    const expiringContracts = contractsData.filter(item => item.status === "Expired").length;

    return { totalContracts, activeContracts, totalValue, expiringContracts };
  }, [contractsData]);

  const columns = [
    { key: "contractNumber", label: "Contract #", filterType: "text" },
    { key: "customer", label: "Customer", filterType: "text" },
    { key: "type", label: "Type", filterType: "select", filterOptions: ["Maintenance", "Service", "Support"] },
    { key: "startDate", label: "Start Date", filterType: "none" },
    { key: "endDate", label: "End Date", filterType: "none" },
    { 
      key: "value", 
      label: "Value (€)", 
      filterType: "none",
      render: (value: number) => `€${value.toFixed(2)}`
    },
    {
      key: "status",
      label: "Status",
      filterType: "select",
      filterOptions: ["Active", "Pending", "Expired", "Cancelled"],
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          value === "Active" ? "bg-green-100 text-green-700" :
          value === "Pending" ? "bg-yellow-100 text-yellow-700" :
          value === "Expired" ? "bg-orange-100 text-orange-700" :
          "bg-red-100 text-red-700"
        }`}>
          {value}
        </span>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    return contractsData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [contractsData, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredData.slice(start, start + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const handleDownload = () => {
    const csv = [
      ["Contract #", "Customer", "Type", "Start Date", "End Date", "Value", "Status"].join(","),
      ...filteredData.map((s) =>
        [s.contractNumber, s.customer, s.type, s.startDate, s.endDate, s.value, s.status].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contracts_report.csv";
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
          <p className="text-sm font-medium text-gray-500">Total Contracts</p>
          <p className="text-xl font-semibold text-gray-900">{summary.totalContracts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Active Contracts</p>
          <p className="text-xl font-semibold text-green-600">{summary.activeContracts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
          <p className="text-xl font-semibold text-orange-600">{summary.expiringContracts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Total Value</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contracts by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
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
