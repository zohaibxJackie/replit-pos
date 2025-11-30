import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Flag, 
  Edit, 
  Trash2,
  ToggleLeft,
  ToggleRight
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
import { Textarea } from '@/components/ui/textarea';
import type { FeatureFlag } from '@shared/schema';

export default function FeatureFlags() {
  useAuth("superAdminFeatureFlags");
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: '1',
      name: 'advanced_analytics',
      description: 'Enable advanced analytics and reporting features',
      isEnabled: true,
      shopId: null,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'multi_currency',
      description: 'Enable multiple currency support',
      isEnabled: false,
      shopId: null,
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10'),
    },
    {
      id: '3',
      name: 'inventory_ai',
      description: 'AI-powered inventory predictions',
      isEnabled: true,
      shopId: 'shop1',
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-05'),
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isEnabled: true,
    shopId: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isEnabled: true,
      shopId: '',
    });
    setEditingFlag(null);
  };

  const handleAddFlag = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      name: flag.name,
      description: flag.description || '',
      isEnabled: flag.isEnabled,
      shopId: flag.shopId || '',
    });
    setIsDialogOpen(true);
  };

  const handleToggleFlag = (flagId: string) => {
    setFlags(flags.map(flag =>
      flag.id === flagId 
        ? { ...flag, isEnabled: !flag.isEnabled, updatedAt: new Date() }
        : flag
    ));
    const flag = flags.find(f => f.id === flagId);
    toast({
      title: flag?.isEnabled ? 'Feature Disabled' : 'Feature Enabled',
      description: `${flag?.name} has been ${flag?.isEnabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleDeleteFlag = (flagId: string) => {
    setFlags(flags.filter(f => f.id !== flagId));
    toast({
      title: 'Feature Flag Deleted',
      description: 'Feature flag has been successfully deleted.',
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Feature name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (editingFlag) {
      setFlags(flags.map(flag =>
        flag.id === editingFlag.id
          ? {
              ...flag,
              name: formData.name,
              description: formData.description,
              isEnabled: formData.isEnabled,
              shopId: formData.shopId || null,
              updatedAt: new Date(),
            }
          : flag
      ));
      toast({
        title: 'Feature Flag Updated',
        description: `${formData.name} has been successfully updated.`,
      });
    } else {
      const newFlag: FeatureFlag = {
        id: `flag-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        isEnabled: formData.isEnabled,
        shopId: formData.shopId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFlags([...flags, newFlag]);
      toast({
        title: 'Feature Flag Created',
        description: `${formData.name} has been successfully created.`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const activeCount = flags.filter(f => f.isEnabled).length;
  const globalCount = flags.filter(f => !f.shopId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Feature Flags</h1>
          <p className="text-muted-foreground mt-1">Manage feature toggles and rollouts</p>
        </div>
        <Button onClick={handleAddFlag} data-testid="button-add-flag">
          <Plus className="w-4 h-4 mr-2" />
          Add Feature Flag
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <Flag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
            <ToggleRight className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Flags</CardTitle>
            <Flag className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell className="font-medium">{flag.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{flag.description || 'No description'}</TableCell>
                  <TableCell>
                    <Badge variant={flag.shopId ? 'secondary' : 'default'}>
                      {flag.shopId ? `Shop: ${flag.shopId}` : 'Global'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={flag.isEnabled}
                        onCheckedChange={() => handleToggleFlag(flag.id)}
                        data-testid={`switch-toggle-${flag.id}`}
                      />
                      <span className="text-sm">
                        {flag.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(flag.updatedAt!).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditFlag(flag)}
                        data-testid={`button-edit-flag-${flag.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFlag(flag.id)}
                        data-testid={`button-delete-flag-${flag.id}`}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</DialogTitle>
            <DialogDescription>
              {editingFlag ? 'Update feature flag settings.' : 'Create a new feature flag for gradual rollouts.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flag-name">Feature Name *</Label>
              <Input
                id="flag-name"
                placeholder="e.g., advanced_analytics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-flag-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this feature does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop-id">Shop ID (Optional)</Label>
              <Input
                id="shop-id"
                placeholder="Leave empty for global flag"
                value={formData.shopId}
                onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                data-testid="input-shop-id"
              />
              <p className="text-xs text-muted-foreground">
                Specify a shop ID to enable this feature for specific shops only
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-enabled">Enabled by Default</Label>
              <Switch
                id="is-enabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                data-testid="switch-enabled"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-submit-flag">
              {editingFlag ? 'Update Flag' : 'Create Flag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
