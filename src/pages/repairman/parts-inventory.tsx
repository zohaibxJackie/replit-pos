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
  Edit,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function RepairmanPartsInventory() {
  useAuth("repair_man");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    category: "",
    quantity: "",
    minQuantity: "",
    cost: "",
  });
  const [parts, setParts] = useState([
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
      name: 'iPad Pro 11" Digitizer',
      partNumber: "APL-IPADP11-DIG",
      category: "Screens",
      quantity: 2,
      minQuantity: 3,
      usedThisMonth: 1,
      cost: "$95.00",
      status: "low_stock",
    },
  ]);

  useEffect(() => {
    setTitle("Parts Inventory");
  }, [setTitle]);

  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const handleAddPart = () => {
    if (
      !formData.name ||
      !formData.partNumber ||
      !formData.category ||
      !formData.quantity ||
      !formData.minQuantity ||
      !formData.cost
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    const minQuantity = parseInt(formData.minQuantity);
    const cost = parseFloat(formData.cost);

    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Error",
        description: "Quantity must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(minQuantity) || minQuantity < 0) {
      toast({
        title: "Error",
        description: "Minimum quantity must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(cost) || cost < 0) {
      toast({
        title: "Error",
        description: "Cost must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    const newPart = {
      id: (parts.length + 1).toString(),
      name: formData.name,
      partNumber: formData.partNumber,
      category: formData.category,
      quantity: quantity,
      minQuantity: minQuantity,
      usedThisMonth: 0,
      cost: `$${cost.toFixed(2)}`,
      status:
        quantity === 0
          ? "out_of_stock"
          : quantity < minQuantity
            ? "low_stock"
            : "in_stock",
    };

    setParts([...parts, newPart]);

    toast({
      title: "Part Added",
      description: `${formData.name} has been added to inventory`,
    });

    setFormData({
      name: "",
      partNumber: "",
      category: "",
      quantity: "",
      minQuantity: "",
      cost: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPart = () => {
    if (
      !formData.name ||
      !formData.partNumber ||
      !formData.category ||
      !formData.quantity ||
      !formData.minQuantity ||
      !formData.cost
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantity = parseInt(formData.quantity);
    const minQuantity = parseInt(formData.minQuantity);
    const cost = parseFloat(formData.cost);

    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Error",
        description: "Quantity must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(minQuantity) || minQuantity < 0) {
      toast({
        title: "Error",
        description: "Minimum quantity must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(cost) || cost < 0) {
      toast({
        title: "Error",
        description: "Cost must be a valid positive number",
        variant: "destructive",
      });
      return;
    }

    const updatedParts = parts.map((part) =>
      part.id === editingPart.id
        ? {
            ...part,
            name: formData.name,
            partNumber: formData.partNumber,
            category: formData.category,
            quantity: quantity,
            minQuantity: minQuantity,
            cost: `$${cost.toFixed(2)}`,
            status:
              quantity === 0
                ? "out_of_stock"
                : quantity < minQuantity
                  ? "low_stock"
                  : "in_stock",
          }
        : part
    );

    setParts(updatedParts);

    toast({
      title: "Part Updated",
      description: `${formData.name} has been updated`,
    });

    setIsEditDialogOpen(false);
    setEditingPart(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Parts Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage your repair parts and track inventory levels
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              name: "",
              partNumber: "",
              category: "",
              quantity: "",
              minQuantity: "",
              cost: "",
            });
            setIsAddDialogOpen(true);
          }}
          data-testid="button-add-part"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Part
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
                      <h3
                        className="font-semibold text-lg"
                        data-testid={`text-part-name-${part.id}`}
                      >
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
                        <p className="text-sm text-muted-foreground">
                          Part Number
                        </p>
                        <p className="text-sm font-medium font-mono">
                          {part.partNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Quantity
                        </p>
                        <p className="text-sm font-medium">
                          {part.quantity} / {part.minQuantity} min
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Used This Month
                        </p>
                        <p className="text-sm font-medium">
                          {part.usedThisMonth}
                        </p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPart(part);
                        setFormData({
                          name: part.name,
                          partNumber: part.partNumber,
                          category: part.category,
                          quantity: part.quantity.toString(),
                          minQuantity: part.minQuantity.toString(),
                          cost: part.cost.replace("$", ""),
                        });
                        setIsEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-${part.id}`}
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

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormData({
              name: "",
              partNumber: "",
              category: "",
              quantity: "",
              minQuantity: "",
              cost: "",
            });
          }
          setIsAddDialogOpen(open);
        }}
      >
        <DialogContent data-testid="dialog-add-part">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
            <DialogDescription>
              Add a new part to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., iPhone 13 Pro LCD Screen"
                data-testid="input-part-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) =>
                  setFormData({ ...formData, partNumber: e.target.value })
                }
                placeholder="e.g., APL-IP13P-LCD"
                data-testid="input-part-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Screens">Screens</SelectItem>
                  <SelectItem value="Batteries">Batteries</SelectItem>
                  <SelectItem value="Charging Ports">Charging Ports</SelectItem>
                  <SelectItem value="Cameras">Cameras</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Min Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minQuantity: e.target.value })
                  }
                  placeholder="0"
                  data-testid="input-min-quantity"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                placeholder="0.00"
                data-testid="input-cost"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              data-testid="button-cancel-add"
            >
              Cancel
            </Button>
            <Button onClick={handleAddPart} data-testid="button-save-part">
              Add Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPart(null);
            setFormData({
              name: "",
              partNumber: "",
              category: "",
              quantity: "",
              minQuantity: "",
              cost: "",
            });
          }
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent data-testid="dialog-edit-part">
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
            <DialogDescription>
              Update part information and inventory levels
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Part Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-partNumber">Part Number</Label>
              <Input
                id="edit-partNumber"
                value={formData.partNumber}
                onChange={(e) =>
                  setFormData({ ...formData, partNumber: e.target.value })
                }
                data-testid="input-edit-part-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger data-testid="select-edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Screens">Screens</SelectItem>
                  <SelectItem value="Batteries">Batteries</SelectItem>
                  <SelectItem value="Charging Ports">Charging Ports</SelectItem>
                  <SelectItem value="Cameras">Cameras</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  data-testid="input-edit-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minQuantity">Min Quantity</Label>
                <Input
                  id="edit-minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, minQuantity: e.target.value })
                  }
                  data-testid="input-edit-min-quantity"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost">Cost ($)</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                data-testid="input-edit-cost"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button onClick={handleEditPart} data-testid="button-update-part">
              Update Part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
