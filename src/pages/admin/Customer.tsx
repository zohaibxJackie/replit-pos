import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Printer, Edit, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { printElement } from "@/utils/print";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTitle } from "@/context/TitleContext";
import { CustomerFormDialog, CustomerFormData } from "@/components/CustomerFormDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, CustomerType } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Customer() {
  useAuth("adminCustomer");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const queryClient = useQueryClient();

  useEffect(() => {
    setTitle(t("admin.clients.title"));
    return () => setTitle("Business Dashboard");
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [viewingClient, setViewingClient] = useState<CustomerType | null>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CustomerFormData | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/customers', page, limit, filters.name],
    queryFn: () => api.customers.getAll({ 
      page, 
      limit, 
      search: filters.name || undefined 
    }),
  });


  const customers = data?.customers || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  const filteredClients = useMemo(() => {
    return customers.filter((c) => {
      const matchesBalance =
        !filters.unpaidBalance ||
        (filters.unpaidBalance === "Paid" && parseFloat(c.unpaidBalance || "0") === 0) ||
        (filters.unpaidBalance === "Unpaid" && parseFloat(c.unpaidBalance || "0") > 0);
      return matchesBalance;
    });
  }, [customers, filters]);

  const handleOpenModal = (client?: CustomerType) => {
    if (client) {
      setEditingClient({
        id: client.id,
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        documentType: client.documentType || "",
        documentNumber: client.documentNumber || "",
        dob: client.dob || "",
        nationality: client.nationality || "",
        address: client.address || "",
        postalCode: client.postalCode || "",
        city: client.city || "",
        province: client.province || "",
      });
    } else {
      setEditingClient(null);
    }
    setIsModalOpen(true);
  };

  const handlePrintRow = async (row: CustomerType) => {
    const container = document.createElement("div");
    container.id = "client-print-container";
    container.innerHTML = `
      <div style="padding:40px;">
        <h2>Client Information</h2>
        <table><tbody>
          ${Object.entries({
            Name: row.name,
            "Document Number": row.documentNumber || "-",
            Email: row.email || "-",
            Phone: row.phone || "-",
            Address: row.address || "-",
            City: row.city || "-",
            Province: row.province || "-",
            "Postal Code": row.postalCode || "-",
            "Total Purchases": `€${row.totalPurchases || "0"}`,
            "Unpaid Balance": `€${row.unpaidBalance || "0"}`,
            "Joining Date": row.createdAt ? format(new Date(row.createdAt), "yyyy-MM-dd") : "-",
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

  const handleCustomerAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/customers'], exact: false });
  };

  const handleViewCustomer = async (customer: CustomerType) => {
    setViewingClient(customer);
    setIsLoadingDetails(true);
    setRecentSales([]);
    try {
      const response = await api.customers.getById(customer.id);
      if (response.customer) {
        setViewingClient(response.customer as CustomerType);
      }
      setRecentSales(response.recentSales || []);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDeleteCustomer = async (customer: CustomerType) => {
    if (!confirm(`Are you sure you want to delete ${customer.name}`)) return; 

    try {
      await api.customers.delete(customer.id)
      toast({
        title: t("admin.clients.delete_success"),
        description: t("admin.clients.delete_success_description", { name: customer.name }),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] })
    } catch(error) {
      toast({
        title: t("common.error"),
        description: t("admin.clients.delete_error"),
        variant: "destructive",
      });
    }
  }

  const handleCloseViewDialog = () => {
    setViewingClient(null);
    setRecentSales([]);
  };

  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none" as const,
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { key: "name", label: t("admin.clients.name"), filterType: "text" as const },
    { key: "documentNumber", label: t("admin.clients.id_number"), filterType: "text" as const },
    { key: "phone", label: t("admin.clients.phone"), filterType: "text" as const },
    { key: "email", label: t("admin.clients.email"), filterType: "none"},
    {
      key: "totalPurchases",
      label: "Total Business",
      filterType: "none" as const,
      render: (value: string) => (
        <span className="font-medium">€{parseFloat(value || "0").toFixed(2)}</span>
      ),
    }
    // {
    //   key: "unpaidBalance",
    //   label: t("admin.clients.unpaid_balance"),
    //   filterType: "select" as const,
    //   filterOptions: ["Paid", "Unpaid"],
    //   render: (value: string) => {
    //     const balance = parseFloat(value || "0");
    //     return balance > 0 ? (
    //       <Badge variant="destructive">€{balance.toFixed(2)}</Badge>
    //     ) : (
    //       <Badge variant="default">€0.00</Badge>
    //     );
    //   },
    // }
    // {
    //   key: "status",
    //   label: "Status",
    //   filterType: "none" as const,
    //   render: (value: string) => (
    //     <Badge variant={value === "active" ? "default" : "secondary"}>
    //       {value?.charAt(0).toUpperCase() + value?.slice(1)}
    //     </Badge>
    //   ),
    // },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-customers">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
          <Button onClick={() => handleOpenModal()} data-testid="button-add-customer">
            <Plus className="w-4 h-4 mr-2" />
            {t("admin.clients.add_client")}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredClients}
        showActions
        renderActions={(row: CustomerType) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleViewCustomer(row)}
              title="View"
              data-testid={`button-view-customer-${row.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handlePrintRow(row)}
              title="Print"
              data-testid={`button-print-customer-${row.id}`}
            >
              <Printer className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleOpenModal(row)}
              title="Edit"
              data-testid={`button-edit-customer-${row.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={() => handleDeleteCustomer(row)}
              title="Delete Customer"
              data-testid={`button-edit-customer-${row.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      <TablePagination
        page={page}
        limit={limit}
        total={pagination.total}
        onPageChange={setPage}
      />

      <CustomerFormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCustomerAdded={handleCustomerAdded}
        editingCustomer={editingClient}
      />

      <Dialog open={!!viewingClient} onOpenChange={handleCloseViewDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-view-customer">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium" data-testid="text-customer-name">{viewingClient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="text-customer-email">{viewingClient.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium" data-testid="text-customer-phone">{viewingClient.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document Number</p>
                  <p className="font-medium" data-testid="text-customer-document">{viewingClient.documentNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{viewingClient.nationality || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{viewingClient.dob || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {[viewingClient.address, viewingClient.city, viewingClient.province, viewingClient.postalCode]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Purchase Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Total Purchases</p>
                    <p className="text-xl font-bold text-green-600" data-testid="text-total-purchases">
                      €{parseFloat(viewingClient.totalPurchases || "0").toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Unpaid Balance</p>
                    <p className="text-xl font-bold text-red-600" data-testid="text-unpaid-balance">
                      €{parseFloat(viewingClient.unpaidBalance || "0").toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">Last Purchase</p>
                    <p className="text-xl font-bold">
                      {viewingClient.lastPurchaseDate 
                        ? format(new Date(viewingClient.lastPurchaseDate), "MMM dd, yyyy")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Recent Purchases
                </h4>
                {isLoadingDetails ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recentSales.length > 0 ? (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {recentSales.map((sale: any, index: number) => (
                        <div key={sale.id || index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <p className="font-medium">Sale #{sale.id?.slice(-6) || index + 1}</p>
                            <p className="text-sm text-muted-foreground">
                              {sale.createdAt ? format(new Date(sale.createdAt), "MMM dd, yyyy") : "-"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">€{parseFloat(sale.total || "0").toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">{sale.paymentMethod || "Cash"}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No purchases recorded yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
