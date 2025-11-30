import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useTitle } from '@/context/TitleContext';

interface ActivityLog {
  id: number;
  description: string;
  stockValue: number;
  totalStockValue: number;
}

export default function ActivityLogs() {
  useAuth("adminActivityLogs");
  const {t} = useTranslation();
  const {setTitle} = useTitle();
  useEffect(() => {
    setTitle(t("admin.activity_log.title"));           
    return () => setTitle('Business Dashboard');
  }, [setTitle]);
  

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Example activity log data
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: 1, description: "Added 10 units of iPhone 12", stockValue: 100, totalStockValue: 1000 },
    { id: 2, description: "Removed 5 units of Samsung Galaxy", stockValue: -50, totalStockValue: 950 },
    { id: 3, description: "Added 20 units of Pixel 8", stockValue: 200, totalStockValue: 1150 },
    // Add more logs as needed
  ]);

  // Calculate Total Available Stock Cost
  const totalStockCost = useMemo(() => {
    return logs.reduce((acc, log) => acc + log.totalStockValue, 0);
  }, [logs]);

  // Filtered Data
  const filteredLogs = useMemo(() => {
    return logs; // Here you can add filters if needed
  }, [logs]);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLogs.slice(start, start + limit);
  }, [filteredLogs, page, limit]);

  // Handle Page Size Change (Records per page)
  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Handle Page Change (Pagination)
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Columns
  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { key: "description", label: "Activity Description", filterType: "text" },
    { key: "stockValue", label: "Stock Value", filterType: "none" },
    { key: "totalStockValue", label: "Total Current Stock Value", filterType: "none" },
  ];

  return (
    <div className="space-y-8">
      {/* Total Available Stock Card */}
      <div className="flex justify-between items-center">
        <Card className="p-4 flex justify-between items-center w-full bg-primary/10">
          <h2 className="text-2xl font-semibold">Available Stock</h2>
          <div className="text-2xl font-bold">{totalStockCost.toFixed(2)} €</div>
        </Card>
      </div>

      {/* Pagination and Records per Page Dropdown above the table */}
      <div className="flex justify-between items-center mb-4">
        <TablePageSizeSelector
          limit={limit}
          onChange={handlePageSizeChange}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginatedLogs}
        showActions={false}
      />

      {/* Pagination Controls Below Table */}
      <div className="mt-4">
        <TablePagination
          page={page}
          limit={limit}
          total={filteredLogs.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
