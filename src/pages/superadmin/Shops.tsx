import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Package,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Shop } from '@shared/schema';

export default function ShopManagement() {
  useAuth("superAdminShops");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  const [shops, setShops] = useState<Shop[]>([
    {
      id: '1',
      name: 'Tech Store Downtown',
      ownerId: 'owner1',
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Mobile Mart',
      ownerId: 'owner2',
      subscriptionTier: 'silver',
      subscriptionStatus: 'active',
      createdAt: new Date('2024-02-20'),
    },
    {
      id: '3',
      name: 'Gadget Hub',
      ownerId: 'owner3',
      subscriptionTier: 'gold',
      subscriptionStatus: 'expired',
      createdAt: new Date('2024-03-10'),
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    ownerId: '',
    subscriptionTier: 'silver',
  });

  const [assignFormData, setAssignFormData] = useState({
    subscriptionTier: '',
  });

  const handleAssignPlan = (shop: Shop) => {
    setSelectedShop(shop);
    setAssignFormData({ subscriptionTier: shop.subscriptionTier });
    setIsAssignDialogOpen(true);
  };

  const handleSubmitAssignment = () => {
    if (!selectedShop) return;

    setShops(shops.map(shop => 
      shop.id === selectedShop.id 
        ? { ...shop, subscriptionTier: assignFormData.subscriptionTier }
        : shop
    ));

    toast({
      title: 'Subscription Updated',
      description: `${selectedShop.name} has been assigned to ${assignFormData.subscriptionTier} plan.`,
    });

    setIsAssignDialogOpen(false);
    setSelectedShop(null);
  };

  const handleDeleteShop = (shopId: string) => {
    setShops(shops.filter(s => s.id !== shopId));
    toast({
      title: 'Shop Deleted',
      description: 'Shop has been successfully deleted.',
    });
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || shop.subscriptionStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'trial':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      silver: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      gold: 'bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200',
      premium: 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200',
    };
    return colors[tier] || colors.silver;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Shop Management</h1>
          <p className="text-muted-foreground mt-1">Manage all shops and their subscriptions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shops.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.filter(s => s.subscriptionStatus === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shops.filter(s => s.subscriptionStatus === 'expired').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-shops"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Owner ID</TableHead>
                <TableHead>Subscription Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>{shop.ownerId}</TableCell>
                  <TableCell>
                    <Badge className={getTierBadge(shop.subscriptionTier)}>
                      {shop.subscriptionTier}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(shop.subscriptionStatus)}`} />
                      <span className="capitalize">{shop.subscriptionStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(shop.createdAt!).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignPlan(shop)}
                        data-testid={`button-assign-plan-${shop.id}`}
                      >
                        Assign Plan
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteShop(shop.id)}
                        data-testid={`button-delete-shop-${shop.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Subscription Plan</DialogTitle>
            <DialogDescription>
              Assign a subscription plan to {selectedShop?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subscription-tier">Subscription Plan *</Label>
              <Select
                value={assignFormData.subscriptionTier}
                onValueChange={(value) => setAssignFormData({ subscriptionTier: value })}
              >
                <SelectTrigger id="subscription-tier" data-testid="select-subscription-tier">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">Silver Plan</SelectItem>
                  <SelectItem value="gold">Gold Plan</SelectItem>
                  <SelectItem value="premium">Premium Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSubmitAssignment} data-testid="button-submit-assignment">
              Assign Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
