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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WholesalerCustomers() {
  useAuth("wholesaler");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTitle("Customers");
  }, [setTitle]);

  const customers = [
    {
      id: "1",
      name: "Tech Solutions Inc.",
      contact: "John Smith",
      email: "john@techsolutions.com",
      phone: "+1 (555) 123-4567",
      totalOrders: 45,
      totalSpent: "$52,450.00",
      lastOrder: "2024-01-20",
      status: "active",
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
      status: "active",
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
      status: "active",
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
      status: "active",
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
      status: "inactive",
      tier: "bronze",
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : "bg-gray-500/10 text-gray-500 border-gray-500/20";
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
      title: "Active Customers",
      value: customers.filter((c) => c.status === "active").length.toString(),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Orders",
      value: customers
        .reduce((sum, c) => sum + c.totalOrders, 0)
        .toString(),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your wholesale customer relationships
          </p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: "Add Customer",
              description: "Customer creation feature coming soon",
            })
          }
          data-testid="button-add-customer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

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

      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No customers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} data-testid={`card-customer-${customer.id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-semibold text-lg"
                        data-testid={`text-customer-name-${customer.id}`}
                      >
                        {customer.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getTierColor(customer.tier)}
                        data-testid={`badge-tier-${customer.id}`}
                      >
                        {customer.tier.charAt(0).toUpperCase() +
                          customer.tier.slice(1)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusColor(customer.status)}
                      >
                        {customer.status.charAt(0).toUpperCase() +
                          customer.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="text-sm font-medium">{customer.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Orders
                        </p>
                        <p className="text-sm font-medium">
                          {customer.totalOrders}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Spent
                        </p>
                        <p className="text-sm font-medium">
                          {customer.totalSpent}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Order: {customer.lastOrder}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "View Customer",
                          description: `Viewing ${customer.name}`,
                        })
                      }
                      data-testid={`button-view-${customer.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "Edit Customer",
                          description: `Editing ${customer.name}`,
                        })
                      }
                      data-testid={`button-edit-${customer.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
