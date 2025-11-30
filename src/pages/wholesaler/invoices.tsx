import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WholesalerInvoices() {
  useAuth("wholesalerInvoices");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setTitle("Invoices");
  }, [setTitle]);

  const invoices = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      customer: "Tech Solutions Inc.",
      issueDate: "2024-01-20",
      dueDate: "2024-02-19",
      amount: "$2,450.00",
      paid: "$2,450.00",
      balance: "$0.00",
      status: "paid",
      orderNumber: "SO-2024-001",
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      customer: "Global Electronics Ltd.",
      issueDate: "2024-01-19",
      dueDate: "2024-02-18",
      amount: "$5,890.00",
      paid: "$2,000.00",
      balance: "$3,890.00",
      status: "partial",
      orderNumber: "SO-2024-002",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      customer: "Retail Pro Store",
      issueDate: "2024-01-18",
      dueDate: "2024-02-17",
      amount: "$3,200.00",
      paid: "$0.00",
      balance: "$3,200.00",
      status: "pending",
      orderNumber: "SO-2024-003",
    },
    {
      id: "4",
      invoiceNumber: "INV-2024-004",
      customer: "Smart Devices Co.",
      issueDate: "2024-01-17",
      dueDate: "2024-01-10",
      amount: "$8,750.00",
      paid: "$0.00",
      balance: "$8,750.00",
      status: "overdue",
      orderNumber: "SO-2024-004",
    },
    {
      id: "5",
      invoiceNumber: "INV-2024-005",
      customer: "Office Supplies Plus",
      issueDate: "2024-01-16",
      dueDate: "2024-02-15",
      amount: "$1,980.00",
      paid: "$1,980.00",
      balance: "$0.00",
      status: "paid",
      orderNumber: "SO-2024-005",
    },
  ];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "partial":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const stats = [
    {
      title: "Total Invoices",
      value: invoices.length.toString(),
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Outstanding",
      value: "$15,840",
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Paid This Month",
      value: "$4,430",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Overdue",
      value: invoices.filter((i) => i.status === "overdue").length.toString(),
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "paid", "partial", "pending", "overdue"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    data-testid={`button-filter-${status}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-4">
        <Button
          onClick={() =>
            toast({
              title: "Create Invoice",
              description: "Invoice creation feature coming soon",
            })
          }
          data-testid="button-create-invoice"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No invoices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} data-testid={`card-invoice-${invoice.id}`} className="flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base" data-testid={`text-invoice-number-${invoice.id}`}>
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={getStatusColor(invoice.status)}
                    data-testid={`badge-status-${invoice.id}`}
                  >
                    {invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-semibold">{invoice.customer}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Issue Date</p>
                    <p className="font-medium">{invoice.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{invoice.dueDate}</p>
                  </div>
                </div>

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{invoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-medium text-green-600">{invoice.paid}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Balance:</span>
                    <span className={invoice.balance === "$0.00" ? "text-green-600" : "text-amber-600"}>
                      {invoice.balance}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground pt-2 border-t">
                  Order: {invoice.orderNumber}
                </p>
              </CardContent>
              <CardContent className="flex gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    toast({
                      title: "View Invoice",
                      description: `Viewing ${invoice.invoiceNumber}`,
                    })
                  }
                  data-testid={`button-view-${invoice.id}`}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    toast({
                      title: "Download Invoice",
                      description: `Downloading ${invoice.invoiceNumber}`,
                    })
                  }
                  data-testid={`button-download-${invoice.id}`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
