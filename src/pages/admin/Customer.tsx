import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Printer, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { printElement } from "@/utils/print";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from "@/context/TitleContext";
import { CustomerFormDialog, CustomerFormData } from "@/components/CustomerFormDialog";

export default function Customer() {
  useAuth(["admin", "sales_person"]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle(t("admin.clients.title"));
    return () => setTitle("Business Dashboard");
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [viewingClient, setViewingClient] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CustomerFormData | null>(null);

  const [clients, setClients] = useState(
    Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Client ${i + 1}`,
      email: `client${i + 1}@example.com`,
      phone: `03${Math.floor(100000000 + i)}`,
      idNumber: `1234567${i}A`,
      address: `Street ${i + 1}, Barcelona`,
      status: "Active",
      joiningDate: "2025-10-18",
      unpaidBalance: i % 3 === 0 ? 200 : 0,
      paymentMethod: i % 2 === 0 ? "Credit Card" : "Cash",
      lastPurchase: "2025-09-25",
    }))
  );

  // Filtering
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesName =
        !filters.name ||
        c.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesId =
        !filters.idNumber ||
        c.idNumber.toLowerCase().includes(filters.idNumber.toLowerCase());
      const matchesBalance =
        !filters.unpaidBalance ||
        (filters.unpaidBalance === "Paid" && c.unpaidBalance === 0) ||
        (filters.unpaidBalance === "Unpaid" && c.unpaidBalance > 0);
      return matchesName && matchesId && matchesBalance;
    });
  }, [clients, filters]);

  const paginatedClients = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredClients.slice(start, start + limit);
  }, [filteredClients, page, limit]);

  // Open Add/Edit Modal
  const handleOpenModal = (client?: any) => {
    setEditingClient(client || null);
    setIsModalOpen(true);
  };

  // 🧾 Print single client info
  const handlePrintRow = async (row: any) => {
    const container = document.createElement("div");
    container.id = "client-print-container";
    container.innerHTML = `
      <div style="padding:40px;">
        <h2>Client Information</h2>
        <table><tbody>
          ${Object.entries({
            Name: row.name,
            "ID Number": row.idNumber,
            Email: row.email,
            Phone: row.phone,
            Address: row.address,
            "Payment Method": row.paymentMethod,
            "Last Purchase": row.lastPurchase,
            "Joining Date": row.joiningDate,
            Status: row.status,
            "Unpaid Balance (€)": row.unpaidBalance,
          })
            .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
            .join("")}
        </tbody></table>
      </div>`;
    document.body.appendChild(container);
    await printElement("client-print-container", {
      title: `Client - ${row.name}`,
      onAfterPrint: () => document.body.removeChild(container),
    });
  };

  // 💾 Save client (Add or Edit)
  const handleCustomerAdded = (customerData: CustomerFormData) => {
    if (editingClient) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? { 
          ...c, 
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          idNumber: customerData.documentNumber || c.idNumber,
        } : c))
      );
    } else {
      const newClient = {
        id: clients.length + 1,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        idNumber: customerData.documentNumber || "",
        address: customerData.address,
        status: "Active",
        joiningDate: new Date().toISOString().split("T")[0],
        unpaidBalance: 0,
        paymentMethod: "Cash",
        lastPurchase: "-",
      };
      setClients([...clients, newClient]);
    }
  };

  // Table columns
  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none" as const,
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { key: "name", label: t("admin.clients.name"), filterType: "text" as const },
    { key: "idNumber", label: t("admin.clients.id_number"), filterType: "text" as const },
    { key: "phone", label: t("admin.clients.phone"), filterType: "text" as const },
    {
      key: "unpaidBalance",
      label: t("admin.clients.unpaid_balance"),
      filterType: "select" as const,
      filterOptions: ["Paid", "Unpaid"],
      render: (value: number) =>
        value > 0 ? (
          <Badge variant="destructive">€{value}</Badge>
        ) : (
          <Badge variant="default">€0</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            {t("admin.clients.add_client")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedClients}
        showActions
        renderActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-blue-100 hover:text-blue-600"
              onClick={() => setViewingClient(row)}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-amber-100 hover:text-amber-600"
              onClick={() => handlePrintRow(row)}
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
              onClick={() => handleOpenModal(row)}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      {/* Pagination */}
      <TablePagination
        page={page}
        limit={limit}
        total={filteredClients.length}
        onPageChange={setPage}
      />

      {/* ✅ Add/Edit Modal */}
      <CustomerFormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCustomerAdded={handleCustomerAdded}
        editingCustomer={editingClient}
      />
    </div>
  );
}
