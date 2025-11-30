import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, UserCog, Lock, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { User } from '@shared/schema';

export default function ManageAdmins() {
  useAuth("superAdminAdmins");
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImpersonateDialogOpen, setIsImpersonateDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  
  const [admins, setAdmins] = useState<User[]>([
    {
      id: '1',
      username: 'john_admin',
      email: 'john@techstore.com',
      password: 'hashed',
      role: 'admin',
      shopId: 'shop1',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      username: 'sarah_admin',
      email: 'sarah@mobilemart.com',
      password: 'hashed',
      role: 'admin',
      shopId: 'shop2',
      createdAt: new Date('2024-02-20'),
    },
  ]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    shopId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAdmin = () => {
    if (!validateForm()) {
      return;
    }

    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      username: formData.username,
      email: formData.email,
      password: 'hashed_' + formData.password,
      role: formData.role,
      shopId: formData.shopId || null,
      createdAt: new Date(),
    };

    setAdmins([...admins, newAdmin]);
    
    toast({
      title: 'Admin Created',
      description: `Admin ${formData.username} has been successfully created. They can now log in with their credentials.`,
    });

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      shopId: '',
    });
    setErrors({});
  };

  const handleImpersonate = (admin: User) => {
    setSelectedAdmin(admin);
    setIsImpersonateDialogOpen(true);
  };

  const confirmImpersonate = () => {
    if (!selectedAdmin) return;

    toast({
      title: 'Impersonating User',
      description: `You are now viewing the system as ${selectedAdmin.username}. This allows you to troubleshoot and provide support.`,
    });

    setIsImpersonateDialogOpen(false);
    setSelectedAdmin(null);
  };

  const handleEdit = (admin: User) => {
    toast({ 
      title: 'Edit Admin', 
      description: `Editing ${admin.username}` 
    });
  };

  const handleDelete = (admin: User) => {
    setAdmins(admins.filter(a => a.id !== admin.id));
    toast({ 
      title: 'Admin Deleted', 
      description: `${admin.username} has been removed.`,
      variant: 'destructive'
    });
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { 
      key: 'shopId', 
      label: 'Shop ID',
      render: (value: string | null) => value || 'N/A'
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant={value === 'super_admin' ? 'default' : 'secondary'}>
          {value?.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Quick Actions',
      render: (_: any, admin: User) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleImpersonate(admin)}
          data-testid={`button-impersonate-${admin.id}`}
        >
          <UserCog className="w-4 h-4 mr-2" />
          Impersonate
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Manage Admins</h1>
          <p className="text-muted-foreground mt-1">Create and manage shop admin accounts</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-add-admin">
          <Plus className="w-4 h-4 mr-2" />
          Create Admin
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={admins}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>
              Create a new admin account to give access to your friend or shop owner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="john_doe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                data-testid="input-username"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  data-testid="input-password"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  data-testid="input-confirm-password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role" data-testid="select-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales_person">Sales Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop-id">Shop ID (Optional)</Label>
              <Input
                id="shop-id"
                placeholder="shop-123"
                value={formData.shopId}
                onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                data-testid="input-shop-id"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if creating for a friend without a shop yet
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} data-testid="button-submit-admin">
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isImpersonateDialogOpen} onOpenChange={setIsImpersonateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Impersonate User</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to impersonate <strong>{selectedAdmin?.username}</strong>. 
              This will allow you to see the system from their perspective and help troubleshoot 
              issues. All actions will be logged for security purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-impersonate">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImpersonate} data-testid="button-confirm-impersonate">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
