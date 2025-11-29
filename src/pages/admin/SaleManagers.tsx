import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, AlertTriangle, Loader2, Key, X, Check, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface StaffLimits {
  currentStaff: number;
  maxStaff: number;
  remainingSlots: number;
  plan: string;
  canAddMore: boolean;
}

interface SalesPerson {
  id: string;
  username: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  active: boolean;
  createdAt: string;
}

interface PasswordResetRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  status: string;
  requestMessage?: string;
  createdAt: string;
}

export default function SalesManagers() {
  useAuth('admin');
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SalesPerson | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
    address: ''
  });
  
  const [newPassword, setNewPassword] = useState('');

  const { data: staffLimits, isLoading: limitsLoading } = useQuery<StaffLimits>({
    queryKey: ['/api/users/staff-limits']
  });

  const { data: staffData, isLoading: staffLoading } = useQuery<{ users: SalesPerson[] }>({
    queryKey: ['/api/users', { role: 'sales_person' }]
  });

  const { data: resetRequests } = useQuery<{ requests: PasswordResetRequest[] }>({
    queryKey: ['/api/users/password-reset-requests', { status: 'pending' }]
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/users/sales-person', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Sales person added successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/staff-limits'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalesPerson> }) => {
      return apiRequest('PUT', `/api/users/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Sales person updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Sales person deactivated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/staff-limits'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password, requestId }: { userId: string; password: string; requestId?: string }) => {
      return apiRequest('POST', `/api/users/${userId}/reset-password`, { newPassword: password, requestId });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Password reset successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/users/password-reset-requests'] });
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest('POST', `/api/users/password-reset-requests/${requestId}/reject`);
    },
    onSuccess: () => {
      toast({ title: 'Request rejected', description: 'Password reset request has been rejected' });
      queryClient.invalidateQueries({ queryKey: ['/api/users/password-reset-requests'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
      whatsapp: '',
      address: ''
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const { password, ...updateData } = formData;
    updateMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const request = resetRequests?.requests?.find(r => r.userId === selectedUser.id);
    resetPasswordMutation.mutate({ 
      userId: selectedUser.id, 
      password: newPassword,
      requestId: request?.id
    });
  };

  const openEditDialog = (user: SalesPerson) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      address: user.address || ''
    });
    setIsEditDialogOpen(true);
  };

  const openResetPasswordDialog = (user: SalesPerson) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordDialogOpen(true);
  };

  const columns = [
    { key: 'username', label: 'Username', filterType: 'none' as const },
    { key: 'email', label: 'Email', filterType: 'none' as const },
    { key: 'phone', label: 'Phone', filterType: 'none' as const },
    {
      key: 'active',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ), filterType: 'none' as const
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString(), filterType: 'none' as const
    },
    {
      key: 'actions',
      label: 'Password',
      render: (_: unknown, row: SalesPerson) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            openResetPasswordDialog(row);
          }}
          data-testid={`button-reset-password-${row.id}`}
        >
          <Key className="w-4 h-4 mr-1" />
          Reset
        </Button>
      ), filterType: 'none' as const
    }
  ];

  const pendingRequests = resetRequests?.requests?.filter(r => r.status === 'pending') || [];
  const staff = staffData?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Manage Staff</h1>
          <p className="text-muted-foreground mt-1">Add and manage sales persons</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
          disabled={!staffLimits?.canAddMore}
          data-testid="button-add-staff"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {staffLimits && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffLimits.currentStaff}</div>
              <p className="text-xs text-muted-foreground">Active sales persons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Limit</CardTitle>
              <Badge variant="outline">{staffLimits.plan}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffLimits.maxStaff}</div>
              <p className="text-xs text-muted-foreground">Maximum allowed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              {!staffLimits.canAddMore && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffLimits.remainingSlots}</div>
              <p className="text-xs text-muted-foreground">
                {staffLimits.canAddMore ? 'Slots remaining' : 'Upgrade plan for more'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Password Reset Requests
            </CardTitle>
            <CardDescription>
              The following staff members have requested password resets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between gap-4 p-3 bg-background rounded-md border"
                >
                  <div>
                    <p className="font-medium">{request.username}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    {request.requestMessage && (
                      <p className="text-sm text-muted-foreground mt-1">{request.requestMessage}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const user = staff.find(s => s.id === request.userId);
                        if (user) openResetPasswordDialog(user);
                      }}
                      data-testid={`button-approve-reset-${request.id}`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Reset Password
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectRequestMutation.mutate(request.id)}
                      disabled={rejectRequestMutation.isPending}
                      data-testid={`button-reject-reset-${request.id}`}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {staffLoading || limitsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={staff}
          showActions
          renderActions={(row: SalesPerson) => (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditDialog(row)}
                data-testid={`button-edit-${row.id}`}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(row.id)}
                data-testid={`button-delete-${row.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sales Person</DialogTitle>
            <DialogDescription>
              Create a new sales person account. They will be able to login and make sales.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  data-testid="input-whatsapp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="input-address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-add">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Sales Person
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sales Person</DialogTitle>
            <DialogDescription>
              Update the sales person details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  data-testid="input-edit-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-edit-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-edit-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                <Input
                  id="edit-whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  data-testid="input-edit-whatsapp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  data-testid="input-edit-address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}. They will be notified of the change.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  data-testid="input-new-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending} data-testid="button-submit-reset-password">
                {resetPasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
