import { useState, useMemo, useEffect } from "react";
import { Package, Download, Calendar } from "lucide-react";
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

export default function AvailableStockReport() {
  useAuth("adminReportsAvailableStock");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { format } = useCurrency();

  useEffect(() => {
    setTitle(t("admin.reports.available_stock.title"));
    return () => setTitle(t("admin.header.dashboard_fallback"));
  }, [setTitle, t]);

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
        status: (50 - i) > 10 ? "IN_STOCK" : "LOW_STOCK",
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
    { key: "sku", label: t("admin.reports.common.sku"), filterType: "text" },
    { key: "product", label: t("admin.reports.common.product_name"), filterType: "text" },
    { key: "category", label: t("admin.reports.common.category"), filterType: "select", filterOptions: ["Mobile", "Accessories"] },
    { key: "quantity", label: t("admin.reports.common.quantity"), filterType: "none" },
    { key: "minStock", label: t("admin.reports.common.min_stock"), filterType: "none" },
    { key: "buyPrice", label: t("admin.reports.common.buy_price"), filterType: "none" },
    { key: "salePrice", label: t("admin.reports.common.sale_price"), filterType: "none" },
    {
      key: "status",
      label: t("admin.reports.common.status"),
      filterType: "select",
      filterOptions: ["IN_STOCK", "LOW_STOCK"],
      render: (value: string) => {
        const translatedStatus = value === "IN_STOCK" ? t("admin.reports.common.in_stock") : t("admin.reports.common.low_stock");
        return (
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
            value === "IN_STOCK" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200"
          }`}>
            {translatedStatus}
          </span>
        );
      },
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
      [
        t("admin.reports.common.sku"), 
        t("admin.reports.common.product_name"), 
        t("admin.reports.common.category"), 
        t("admin.reports.common.quantity"), 
        t("admin.reports.common.min_stock"), 
        t("admin.reports.common.buy_price"), 
        t("admin.reports.common.sale_price"), 
        t("admin.reports.common.status")
      ].join(","),
      ...filteredStock.map((s) => {
        const translatedStatus = s.status === "IN_STOCK" ? t("admin.reports.common.in_stock") : t("admin.reports.common.low_stock");
        return [s.sku, s.product, s.category, s.quantity, s.minStock, s.buyPrice, s.salePrice, translatedStatus].join(",");
      }),
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
                  {formatDate(new Date(dateRange.from), "MMM d, yyyy")} - {formatDate(new Date(dateRange.to), "MMM d, yyyy")}
                </>
              ) : (
                t("admin.reports.common.date_range")
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-sm font-medium">{t("admin.reports.common.from")}</label>
                <Input
                  className="!w-full sm:!w-9/12 justify-center"
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-sm font-medium">{t("admin.reports.common.to")}</label>
                <Input
                  className="!w-full sm:!w-9/12 justify-center"
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
              <Button data-testid="button-apply-date">{t("admin.reports.common.apply")}</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("admin.reports.common.total_items")}</p>
          <p className="text-xl font-semibold">{summary.totalItems}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("admin.reports.common.total_quantity")}</p>
          <p className="text-xl font-semibold">{summary.totalQuantity}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("admin.reports.common.in_stock")}</p>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400">{summary.inStockItems}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("admin.reports.common.low_stock")}</p>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{summary.lowStockItems}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">{t("admin.reports.common.total_value")}</p>
          <p className="text-xl font-semibold">{format(summary.totalValue)}</p>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t("admin.reports.available_stock.chart_title")}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#8884d8" name={t("admin.reports.common.quantity")} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mb-4">
        <Select
          value={String(recordsPerPage)}
          onValueChange={(value) => {
            setRecordsPerPage(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-records-per-page">
            <SelectValue placeholder={t("admin.reports.common.records_per_page")} />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {t("admin.common.show")} {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleDownload} variant="default" data-testid="button-download" className="w-full sm:w-auto">
          <Download className="w-4 h-4" /> {t("admin.reports.common.download")}
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
