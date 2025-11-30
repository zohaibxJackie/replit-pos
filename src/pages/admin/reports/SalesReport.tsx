import { useState, useMemo, useEffect } from "react";
import {   DollarSign,   CreditCard,   Wallet,   Banknote,   Ticket,   Coins,   Calendar,   Download, } from "lucide-react";
import DataTable from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {   Select,   SelectTrigger,   SelectValue,   SelectContent,   SelectItem, } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { TablePagination } from "@/components/ui/tablepagination";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from '@/context/TitleContext';

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function DailySalesReport() {
  useAuth("adminReportsSales");
  const { toast } = useToast();
  const { t } = useTranslation();
  const {setTitle} = useTitle();
  useEffect(() => {
    setTitle(t("admin.sales_report.title"));               
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
  const sales = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        ticket: `#00${i + 1}`,
        date: `2025-10-${(i % 30) + 1} ${(i % 12) + 1}:00 PM`,
        product: i % 2 === 0 ? "iPhone 13" : "Charger",
        imei: i % 2 === 0 ? "123456789" : "-",
        buyPrice: i % 2 === 0 ? 800 : 10,
        salePrice: i % 2 === 0 ? 950 : 20,
        qty: i % 2 === 0 ? 1 : 2,
        paymentType: i % 3 === 0 ? "Card" : i % 3 === 1 ? "Cash" : "Bank",
        saleType: i % 2 === 0 ? "Mobile" : "Accessories",
      })),
    []
  );

  const summary = {
    sale: 1195,
    card: 320,
    credit: 180,
    bank: 250,
    voucher: 50,
    cash: 395,
  };

  const columns = [
    { key: "ticket", label: t("admin.sales_report.ticket"), filterType: "none" },
    { key: "date", label: t("admin.sales_report.date"), filterType: "none" },
    { key: "product", label: t("admin.sales_report.product"), filterType: "text" },
    { key: "imei", label: t("admin.sales_report.imei"), filterType: "text" },
    { key: "buyPrice", label: t("admin.sales_report.buy_price"), filterType: "none" },
    { key: "salePrice", label: t("admin.sales_report.sale_price"), filterType: "none" },
    { key: "qty", label: t("admin.sales_report.quantity"), filterType: "none" },
    {
      key: "paymentType",
      label: t("admin.sales_report.payment_type"),
      filterType: "select",
      filterOptions: ["Card", "Cash", "Bank"],
    },
    { key: "saleType", label: t("admin.sales_report.sale_type"), filterType: "select", filterOptions: ["Mobile", "Accessories"] },
  ];

  // Filtering logic using DataTable
  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [sales, filters]);

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * recordsPerPage;
    return filteredSales.slice(start, start + recordsPerPage);
  }, [filteredSales, page, recordsPerPage]);

  // Download CSV
  const handleDownload = () => {
    const csv = [
      [
        "Ticket",
        "Date / Time",
        "Product",
        "IMEI / Serial / EAN",
        "Buy Price",
        "Sale Price",
        "Quantity",
        "Payment Type",
        "Sale Type",
      ].join(","),
      ...filteredSales.map((s) =>
        [
          s.ticket,
          s.date,
          s.product,
          s.imei,
          s.buyPrice,
          s.salePrice,
          s.qty,
          s.paymentType,
          s.saleType,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "daily_sales_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Date Range Picker */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 font-medium"
            >
              <Calendar className="w-4 h-4" />
              {dateRange?.from && dateRange?.to ? (
                <>
                  {format(new Date(dateRange.from), "MMM d, yyyy")} -{" "}
                  {format(new Date(dateRange.to), "MMM d, yyyy")}
                </>
              ) : (
                t("admin.sales_report.select_date_range")
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-3 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">{t("admin.sales_report.from")}</label>
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
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">{t("admin.sales_report.to")}</label>
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
                />
              </div>
              <Button
                onClick={() =>
                  toast({
                    title: t("admin.sales_report.range_applied"),
                    description:
                      dateRange.from && dateRange.to
                        ? `${dateRange.from.toLocaleDateString()} – ${dateRange.to.toLocaleDateString()}`
                        : t("admin.sales_report.no_range"),
                  })
                }
              >
                {t("admin.sales_report.apply")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Minimal Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("admin.sales_report.total_sale")}</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.sale}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("admin.sales_report.card")}</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.card}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("admin.sales_report.credit")}</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.credit}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("admin.sales_report.bank")}</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.bank}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("admin.sales_report.voucher")}</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.voucher}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-sm font-medium text-gray-500">{t("admin.sales_report.cash")}</p>
          <p className="text-xl font-semibold text-gray-900">€{summary.cash}</p>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <Select
          value={String(recordsPerPage)}
          onValueChange={(value) => {
            setRecordsPerPage(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("admin.sales_report.records_per_page")} />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                Show {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleDownload}
          variant={"default"}
        >
          <Download className="w-4 h-4" /> {t("admin.sales_report.download")}
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedSales}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      {/* Pagination */}
      <TablePagination
        page={page}
        limit={recordsPerPage}
        total={filteredSales.length}
        onPageChange={setPage}
      />
    </div>
  );
}
