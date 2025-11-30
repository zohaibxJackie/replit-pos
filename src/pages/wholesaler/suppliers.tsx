import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Building2,
  TrendingUp,
  ShoppingBag,
  Clock,
  Eye,
  Edit,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function WholesalerSuppliers() {
  useAuth("wholesalerSuppliers");;
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTitle("Suppliers");
  }, [setTitle]);

  const suppliers = [
    {
      id: "1",
      name: "Premium Tech Distributors",
      contact: "David Chen",
      email: "david@premiumtech.com",
      phone: "+1 (555) 111-2222",
      category: "Electronics",
      productsSupplied: 45,
      totalPurchases: "$125,000",
      leadTime: "5-7 days",
      status: "active",
      rating: 5,
    },
    {
      id: "2",
      name: "Global Audio Solutions",
      contact: "Maria Garcia",
      email: "maria@globalaudio.com",
      phone: "+1 (555) 222-3333",
      category: "Audio",
      productsSupplied: 28,
      totalPurchases: "$78,500",
      leadTime: "7-10 days",
      status: "active",
      rating: 4,
    },
    {
      id: "3",
      name: "Accessory Wholesale Co.",
      contact: "James Wilson",
      email: "james@accessorywholesale.com",
      phone: "+1 (555) 333-4444",
      category: "Accessories",
      productsSupplied: 65,
      totalPurchases: "$92,300",
      leadTime: "3-5 days",
      status: "active",
      rating: 5,
    },
    {
      id: "4",
      name: "Computing Parts Direct",
      contact: "Lisa Anderson",
      email: "lisa@computingparts.com",
      phone: "+1 (555) 444-5555",
      category: "Computing",
      productsSupplied: 52,
      totalPurchases: "$156,800",
      leadTime: "4-6 days",
      status: "active",
      rating: 4,
    },
    {
      id: "5",
      name: "Budget Electronics Inc.",
      contact: "Tom Brown",
      email: "tom@budgetelec.com",
      phone: "+1 (555) 555-6666",
      category: "Electronics",
      productsSupplied: 23,
      totalPurchases: "$42,100",
      leadTime: "10-14 days",
      status: "inactive",
      rating: 3,
    },
  ];

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return "text-green-500";
    if (rating >= 4) return "text-blue-500";
    if (rating >= 3) return "text-amber-500";
    return "text-red-500";
  };

  const stats = [
    {
      title: "Total Suppliers",
      value: suppliers.length.toString(),
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Suppliers",
      value: suppliers.filter((s) => s.status === "active").length.toString(),
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Products Sourced",
      value: suppliers
        .reduce((sum, s) => sum + s.productsSupplied, 0)
        .toString(),
      icon: ShoppingBag,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg Lead Time",
      value: "6 days",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Suppliers</h2>
          <p className="text-sm text-muted-foreground">
            Manage supplier relationships and procurement
          </p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: "Add Supplier",
              description: "Supplier creation feature coming soon",
            })
          }
          data-testid="button-add-supplier"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
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
              placeholder="Search by name, contact, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No suppliers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              data-testid={`card-supplier-${supplier.id}`}
            >
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-semibold text-lg"
                        data-testid={`text-supplier-name-${supplier.id}`}
                      >
                        {supplier.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getStatusColor(supplier.status)}
                        data-testid={`badge-status-${supplier.id}`}
                      >
                        {supplier.status.charAt(0).toUpperCase() +
                          supplier.status.slice(1)}
                      </Badge>
                      <Badge variant="outline">{supplier.category}</Badge>
                      <span
                        className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}
                      >
                        {"★".repeat(supplier.rating)}
                        {"☆".repeat(5 - supplier.rating)}
                      </span>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="text-sm font-medium">
                          {supplier.contact}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{supplier.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{supplier.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Products
                        </p>
                        <p className="text-sm font-medium">
                          {supplier.productsSupplied}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Purchases
                        </p>
                        <p className="text-sm font-medium">
                          {supplier.totalPurchases}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Lead Time: {supplier.leadTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "View Supplier",
                          description: `Viewing ${supplier.name}`,
                        })
                      }
                      data-testid={`button-view-${supplier.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast({
                          title: "Edit Supplier",
                          description: `Editing ${supplier.name}`,
                        })
                      }
                      data-testid={`button-edit-${supplier.id}`}
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
