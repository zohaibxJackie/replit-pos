import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from '@/context/TitleContext';

interface RechargePayment {
  id: number;
  date: string;
  number: string;
  serviceName: string;
  country: string;
  authorization: string;
  amount: number;
  type: string;
  status: string;
}

export default function RechargePayments() {
  useAuth("adminRechargePayments");
  const { t } = useTranslation();
  const {setTitle} = useTitle();
  useEffect(() => {
    setTitle(t("admin.recharge_payments.title"));           
    return () => setTitle('Business Dashboard');
  }, [setTitle]);
  // Dummy data for recharge payments
  const [payments, setPayments] = useState<RechargePayment[]>(
    Array.from({ length: 250 }, (_, i) => ({

        id: i,
        date: "2025-10-23",
        number: `1234567890${i}`,
        serviceName: "T-Mobile",
        country: "USA",
        authorization: `AUTH1234${i}`,
        amount: (50.0 + i) * 2,
        type: "Credit",
        status: "Completed"
    }))
);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState<RechargePayment | null>(null);

  // Pagination States
  const [page, setPage] = useState(1); // current page
  const [limit, setLimit] = useState(10); // records per page

  // Filtered data
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesDate = !filters.date || payment.date.includes(filters.date);
      const matchesNumber = !filters.number || payment.number.includes(filters.number);
      const matchesService = !filters.serviceName || payment.serviceName.includes(filters.serviceName);
      const matchesCountry = !filters.country || payment.country.includes(filters.country);
      const matchesAmount = !filters.amount || payment.amount.toString().includes(filters.amount);
      const matchesStatus = !filters.status || payment.status === filters.status;

      return matchesDate && matchesNumber && matchesService && matchesCountry && matchesAmount && matchesStatus;
    });
  }, [payments, filters]);

  // Paginated data
  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredPayments.slice(start, start + limit);
  }, [filteredPayments, page, limit]);

  // Columns Definition
  const columns = [
    { key: "date", label: t("admin.recharge_payments.columns.time"), filterType: "text" },
    { key: "number", label: t("admin.recharge_payments.columns.number"), filterType: "text" },
    { key: "serviceName", label: t("admin.recharge_payments.columns.service_name"), filterType: "text" },
    { key: "country", label: t("admin.recharge_payments.columns.country"), filterType: "select", filterOptions: ["USA", "UK"] },
    { key: "authorization", label: t("admin.recharge_payments.columns.auth"), filterType: "text" },
    { key: "amount", label: t("admin.recharge_payments.columns.amount"), filterType: "text" },
    { key: "type", label: t("admin.recharge_payments.columns.type"), filterType: "text" },
    { key: "status", label: t("admin.recharge_payments.columns.status"), filterType: "select", filterOptions: ["Completed", "Pending"] },
  ];

  // Handle filter changes for multiple filters at once
  const handleFilterChange = (filters: Record<string, string>) => {
    setFilters(filters);
  };

  // Handle page size change (records per page)
  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when page size is changed
  };

  // Handle page change (pagination)
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-8">

      {/* Pagination and Records per Page Dropdown above table */}
      <div className="flex justify-end items-center mb-4">
        <TablePageSizeSelector
          limit={limit}
          onChange={handlePageSizeChange}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={paginatedPayments}
        onFilterChange={handleFilterChange}
      />

      {/* Pagination Controls Below Table */}
      <div className="mt-4">
        <TablePagination
          page={page}
          limit={limit}
          total={filteredPayments.length}
          onPageChange={handlePageChange}
        />
      </div>

      {/* View Details Modal */}
      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {viewPayment && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recharge Payment Details</h2>
            <p><b>Date:</b> {viewPayment.date}</p>
            <p><b>Number:</b> {viewPayment.number}</p>
            <p><b>Service Name:</b> {viewPayment.serviceName}</p>
            <p><b>Country:</b> {viewPayment.country}</p>
            <p><b>Authorization:</b> {viewPayment.authorization}</p>
            <p><b>Amount:</b> €{viewPayment.amount.toFixed(2)}</p>
            <p><b>Type:</b> {viewPayment.type}</p>
            <p><b>Status:</b> {viewPayment.status}</p>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </FormPopupModal>
    </div>
  );
}
