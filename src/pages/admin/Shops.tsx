import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTitle } from '@/context/TitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Pencil,
  Loader2,
  Store,
  Package,
  AlertTriangle
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import type { Shop } from '@shared/schema';

interface MyShopsResponse {
  shops: Shop[];
  maxShops: number;
  canAddMore: boolean;
}

export default function AdminShops() {
  useAuth("adminShops");
  const { setTitle } = useTitle();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: ''
  });

  useEffect(() => {
    setTitle(t('admin.shops.title') || 'My Shops');
    return () => setTitle(t('admin.common.dashboard') || 'Dashboard');
  }, [setTitle, t]);

  const { data: shopsData, isLoading } = useQuery<MyShopsResponse>({
    queryKey: ['/api/shops/my-shops']
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.shops.createAdminShop(data);
    },
    onSuccess: () => {
      toast({ 
        title: t('admin.shops.toast.success') || 'Success', 
        description: t('admin.shops.toast.shop_created') || 'Shop has been created successfully.' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shops/my-shops'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ 
        title: t('admin.shops.toast.error') || 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; phone?: string; whatsapp?: string; address?: string } }) => {
      return api.shops.updateAdminShop(id, data);
    },
    onSuccess: () => {
      toast({ 
        title: t('admin.shops.toast.success') || 'Success', 
        description: t('admin.shops.toast.shop_updated') || 'Shop has been updated successfully.' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shops/my-shops'] });
      setIsEditDialogOpen(false);
      setSelectedShop(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: t('admin.shops.toast.error') || 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      address: ''
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ 
        title: t('admin.shops.toast.error') || 'Error', 
        description: t('admin.shops.form.name_required') || 'Shop name is required.', 
        variant: 'destructive' 
      });
      return;
    }
    createMutation.mutate({ ...formData, name: formData.name.trim() });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;
    if (!formData.name.trim()) {
      toast({ 
        title: t('admin.shops.toast.error') || 'Error', 
        description: t('admin.shops.form.name_required') || 'Shop name is required.', 
        variant: 'destructive' 
      });
      return;
    }
    updateMutation.mutate({ id: selectedShop.id, data: { ...formData, name: formData.name.trim() } });
  };

  const openEditDialog = (shop: Shop) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      phone: shop.phone || '',
      whatsapp: shop.whatsapp || '',
      address: shop.address || ''
    });
    setIsEditDialogOpen(true);
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      silver: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      gold: 'bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200',
      premium: 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200',
      platinum: 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200',
    };
    return colors[tier] || colors.silver;
  };

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

  const shops = shopsData?.shops || [];
  const maxShops = shopsData?.maxShops || 1;
  const canAddMore = shopsData?.canAddMore ?? false;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.shops.cards.total_shops') || 'Total Shops'}</CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shops.length}</div>
            <p className="text-xs text-muted-foreground">{t('admin.shops.cards.your_shops') || 'Your registered shops'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.shops.cards.shop_limit') || 'Shop Limit'}</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxShops}</div>
            <p className="text-xs text-muted-foreground">{t('admin.shops.cards.max_allowed') || 'Maximum allowed by plan'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.shops.cards.available_slots') || 'Available Slots'}</CardTitle>
            {!canAddMore && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxShops - shops.length}</div>
            <p className="text-xs text-muted-foreground">
              {canAddMore 
                ? (t('admin.shops.cards.slots_remaining') || 'Slots remaining')
                : (t('admin.shops.cards.upgrade_for_more') || 'Upgrade plan for more')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">{t('admin.shops.my_shops') || 'My Shops'}</h2>
        <Button
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          disabled={!canAddMore}
          data-testid="button-add-shop"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.shops.buttons.add_shop') || 'Add Shop'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : shops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('admin.shops.no_shops') || 'No Shops Yet'}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('admin.shops.no_shops_description') || 'Get started by adding your first shop.'}
            </p>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} data-testid="button-add-first-shop">
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.shops.buttons.add_first_shop') || 'Add Your First Shop'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.shops.table.shop_name') || 'Shop Name'}</TableHead>
                  <TableHead>{t('admin.shops.table.phone') || 'Phone'}</TableHead>
                  <TableHead>{t('admin.shops.table.address') || 'Address'}</TableHead>
                  <TableHead>{t('admin.shops.table.tier') || 'Subscription'}</TableHead>
                  <TableHead>{t('admin.shops.table.status') || 'Status'}</TableHead>
                  <TableHead>{t('admin.shops.table.created') || 'Created'}</TableHead>
                  <TableHead className="text-right">{t('admin.shops.table.actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.phone || '-'}</TableCell>
                    <TableCell>{shop.address || '-'}</TableCell>
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
                    <TableCell>
                      {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(shop)}
                        data-testid={`button-edit-shop-${shop.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.shops.modal.add_title') || 'Add New Shop'}</DialogTitle>
            <DialogDescription>
              {t('admin.shops.modal.add_description') || 'Create a new shop to manage your business locations.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.shops.form.name') || 'Shop Name'} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('admin.shops.form.name_placeholder') || 'Enter shop name'}
                  required
                  data-testid="input-shop-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('admin.shops.form.phone') || 'Phone'}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('admin.shops.form.phone_placeholder') || 'Enter phone number'}
                  data-testid="input-shop-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">{t('admin.shops.form.whatsapp') || 'WhatsApp'}</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder={t('admin.shops.form.whatsapp_placeholder') || 'Enter WhatsApp number'}
                  data-testid="input-shop-whatsapp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('admin.shops.form.address') || 'Address'}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('admin.shops.form.address_placeholder') || 'Enter shop address'}
                  data-testid="input-shop-address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('admin.shops.buttons.cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-add-shop">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('admin.shops.buttons.add_shop') || 'Add Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.shops.modal.edit_title') || 'Edit Shop'}</DialogTitle>
            <DialogDescription>
              {t('admin.shops.modal.edit_description') || 'Update your shop details.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t('admin.shops.form.name') || 'Shop Name'} *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-edit-shop-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t('admin.shops.form.phone') || 'Phone'}</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-edit-shop-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">{t('admin.shops.form.whatsapp') || 'WhatsApp'}</Label>
                <Input
                  id="edit-whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  data-testid="input-edit-shop-whatsapp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">{t('admin.shops.form.address') || 'Address'}</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="input-edit-shop-address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('admin.shops.buttons.cancel') || 'Cancel'}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit-shop">
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('admin.shops.buttons.update') || 'Update Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
