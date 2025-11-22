import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Eye,
  Edit,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";

type Customer = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
  lastOrder: string;
  tier: "gold" | "silver" | "bronze";
};

export default function WholesalerCustomers() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitle("Customers");
  }, [setTitle]);

  const customers: Customer[] = [
    {
      id: "1",
      name: "Tech Solutions Inc.",
      contact: "John Smith",
      email: "john@techsolutions.com",
      phone: "+1 (555) 123-4567",
      totalOrders: 45,
      totalSpent: "$52,450.00",
      lastOrder: "2024-01-20",
      tier: "gold",
    },
    {
      id: "2",
      name: "Global Electronics Ltd.",
      contact: "Sarah Johnson",
      email: "sarah@globalelec.com",
      phone: "+1 (555) 234-5678",
      totalOrders: 32,
      totalSpent: "$38,920.00",
      lastOrder: "2024-01-19",
      tier: "silver",
    },
    {
      id: "3",
      name: "Retail Pro Store",
      contact: "Mike Wilson",
      email: "mike@retailpro.com",
      phone: "+1 (555) 345-6789",
      totalOrders: 28,
      totalSpent: "$29,800.00",
      lastOrder: "2024-01-18",
      tier: "bronze",
    },
    {
      id: "4",
      name: "Smart Devices Co.",
      contact: "Emily Davis",
      email: "emily@smartdevices.com",
      phone: "+1 (555) 456-7890",
      totalOrders: 65,
      totalSpent: "$78,500.00",
      lastOrder: "2024-01-17",
      tier: "gold",
    },
    {
      id: "5",
      name: "Office Supplies Plus",
      contact: "Robert Brown",
      email: "robert@officesupplies.com",
      phone: "+1 (555) 567-8901",
      totalOrders: 12,
      totalSpent: "$15,200.00",
      lastOrder: "2023-12-10",
      tier: "bronze",
    },
  ];

  // First level: filter by search term
  const searchFiltered = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [customers, searchTerm]);

  // Second level: apply DataTable column filters
  const fullyFiltered = useMemo(() => {
    return searchFiltered.filter((customer) => {
      let matchesFilters = true;
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
          const customerValue = String(customer[key as keyof Customer] || '').toLowerCase();
          matchesFilters = matchesFilters && customerValue.includes(value.toLowerCase());
        }
      });
      return matchesFilters;
    });
  }, [searchFiltered, filters]);

  // Third level: paginate
  const paginatedCustomers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return fullyFiltered.slice(startIndex, endIndex);
  }, [fullyFiltered, page, limit]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "gold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-500";
      case "silver":
        return "bg-gray-400/10 text-gray-600 border-gray-400/20 dark:text-gray-400";
      case "bronze":
        return "bg-orange-600/10 text-orange-700 border-orange-600/20 dark:text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const stats = [
    {
      title: "Total Customers",
      value: customers.length.toString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Gold Tier",
      value: customers.filter((c) => c.tier === "gold").length.toString(),
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Total Orders",
      value: customers.reduce((sum, c) => sum + c.totalOrders, 0).toString(),
      icon: ShoppingCart,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Revenue",
      value: "$214,870",
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  // DataTable columns
  const columns = [
    {
      key: "name",
      label: "Company Name",
      filterType: "text" as const,
      render: (value: string) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      key: "contact",
      label: "Contact Person",
      filterType: "text" as const,
    },
    {
      key: "email",
      label: "Email",
      filterType: "text" as const,
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      filterType: "text" as const,
    },
    {
      key: "tier",
      label: "Tier",
      filterType: "select" as const,
      filterOptions: ["gold", "silver", "bronze"],
      render: (value: string) => (
        <Badge className={getTierColor(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "totalOrders",
      label: "Orders",
      filterType: "none" as const,
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: "totalSpent",
      label: "Total Spent",
      filterType: "none" as const,
      render: (value: string) => (
        <span className="font-bold text-green-600">{value}</span>
      ),
    },
    {
      key: "lastOrder",
      label: "Last Order",
      filterType: "none" as const,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">{value}</span>
      ),
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
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <TablePageSizeSelector limit={limit} onChange={(val) => {
          setLimit(val);
          setPage(1);
        }} />
      </div>

      <DataTable
        columns={columns}
        data={paginatedCustomers}
        showActions
        renderActions={(row) => (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" data-testid={`button-view-${row.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" data-testid={`button-edit-${row.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />

      <TablePagination
        page={page}
        limit={limit}
        total={fullyFiltered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
