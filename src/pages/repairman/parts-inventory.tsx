import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingDown,
  Plus,
  MinusCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function RepairmanPartsInventory() {
  useAuth('repair_man');
  const { setTitle } = useTitle();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTitle("Parts Inventory");
  }, [setTitle]);

  const parts = [
    {
      id: "1",
      name: "iPhone 13 Pro LCD Screen",
      partNumber: "APL-IP13P-LCD",
      category: "Screens",
      quantity: 12,
      minQuantity: 5,
      usedThisMonth: 8,
      cost: "$85.00",
      status: "in_stock",
    },
    {
      id: "2",
      name: "Samsung S21 Battery",
      partNumber: "SAM-S21-BAT",
      category: "Batteries",
      quantity: 3,
      minQuantity: 5,
      usedThisMonth: 5,
      cost: "$28.00",
      status: "low_stock",
    },
    {
      id: "3",
      name: "Universal USB-C Charging Port",
      partNumber: "UNI-USBC-PORT",
      category: "Charging Ports",
      quantity: 25,
      minQuantity: 10,
      usedThisMonth: 12,
      cost: "$12.00",
      status: "in_stock",
    },
    {
      id: "4",
      name: "iPhone 12 Rear Camera",
      partNumber: "APL-IP12-CAM",
      category: "Cameras",
      quantity: 0,
      minQuantity: 3,
      usedThisMonth: 2,
      cost: "$45.00",
      status: "out_of_stock",
    },
    {
      id: "5",
      name: "Google Pixel 6 LCD",
      partNumber: "GOO-P6-LCD",
      category: "Screens",
      quantity: 7,
      minQuantity: 4,
      usedThisMonth: 3,
      cost: "$62.00",
      status: "in_stock",
    },
    {
      id: "6",
      name: "iPad Pro 11\" Digitizer",
      partNumber: "APL-IPADP11-DIG",
      category: "Screens",
      quantity: 2,
      minQuantity: 3,
      usedThisMonth: 1,
      cost: "$95.00",
      status: "low_stock",
    },
  ];

  const filteredParts = parts.filter((part) =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "low_stock":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "out_of_stock":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return status;
    }
  };

  const lowStockParts = parts.filter((p) => p.quantity < p.minQuantity);
  const outOfStockParts = parts.filter((p) => p.quantity === 0);

  const stats = [
    {
      title: "Total Parts",
      value: parts.length.toString(),
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockParts.length.toString(),
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Out of Stock",
      value: outOfStockParts.length.toString(),
      icon: MinusCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Used This Month",
      value: parts.reduce((sum, p) => sum + p.usedThisMonth, 0).toString(),
      icon: TrendingDown,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parts Inventory</h1>
        <p className="text-muted-foreground">Track and manage your repair parts stock</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
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

      {(lowStockParts.length > 0 || outOfStockParts.length > 0) && (
        <Card className="border-amber-500/50" data-testid="card-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockParts.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-sm font-medium text-red-500">
                    {outOfStockParts.length} part(s) out of stock
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {outOfStockParts.map((p) => p.name).join(", ")}
                  </p>
                </div>
              )}
              {lowStockParts.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <p className="text-sm font-medium text-amber-500">
                    {lowStockParts.length} part(s) running low
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lowStockParts.map((p) => p.name).join(", ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-search">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by part name, number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredParts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No parts found matching your search</p>
            </CardContent>
          </Card>
        ) : (
          filteredParts.map((part) => (
            <Card key={part.id} data-testid={`card-part-${part.id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg" data-testid={`text-part-name-${part.id}`}>
                        {part.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getStatusColor(part.status)}
                        data-testid={`badge-status-${part.id}`}
                      >
                        {getStatusText(part.status)}
                      </Badge>
                      <Badge variant="outline">{part.category}</Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Part Number</p>
                        <p className="text-sm font-medium font-mono">{part.partNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="text-sm font-medium">
                          {part.quantity} / {part.minQuantity} min
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Used This Month</p>
                        <p className="text-sm font-medium">{part.usedThisMonth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="text-sm font-medium">{part.cost}</p>
                      </div>
                    </div>

                    {part.quantity < part.minQuantity && (
                      <div className="flex items-center gap-2 text-amber-500 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          {part.quantity === 0
                            ? "Out of stock - order immediately"
                            : `Stock below minimum (${part.minQuantity - part.quantity} needed)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-request-${part.id}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      Request
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
