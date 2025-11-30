import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserCog, 
  Ban, 
  CheckCircle,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export default function UserManagement() {
  useAuth("superAdminUsers");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'impersonate' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'super_admin',
      email: 'admin@system.com',
      password: 'hashed',
      role: 'super_admin',
      shopId: null,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      username: 'john_admin',
      email: 'john@techstore.com',
      password: 'hashed',
      role: 'admin',
      shopId: 'shop1',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      username: 'mike_sales',
      email: 'mike@techstore.com',
      password: 'hashed',
      role: 'sales_person',
      shopId: 'shop1',
      createdAt: new Date('2024-02-10'),
    },
    {
      id: '4',
      username: 'sarah_admin',
      email: 'sarah@mobilemart.com',
      password: 'hashed',
      role: 'admin',
      shopId: 'shop2',
      createdAt: new Date('2024-02-20'),
    },
  ]);

  const handleAction = (user: User, type: 'ban' | 'impersonate') => {
    setSelectedUser(user);
    setActionType(type);
    setIsActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedUser || !actionType) return;

    if (actionType === 'ban') {
      toast({
        title: 'User Banned',
        description: `${selectedUser.username} has been banned from the system.`,
        variant: 'destructive',
      });
    } else if (actionType === 'impersonate') {
      toast({
        title: 'Impersonating User',
        description: `You are now viewing as ${selectedUser.username}.`,
      });
    }

    setIsActionDialogOpen(false);
    setSelectedUser(null);
    setActionType(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      admin: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      sales_person: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    };
    return colors[role] || colors.admin;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="w-4 h-4" />;
      case 'admin':
        return <UserCheck className="w-4 h-4" />;
      case 'sales_person':
        return <UsersIcon className="w-4 h-4" />;
      default:
        return <UsersIcon className="w-4 h-4" />;
    }
  };

  const stats = {
    total: users.length,
    superAdmins: users.filter(u => u.role === 'super_admin').length,
    admins: users.filter(u => u.role === 'admin').length,
    salesPersons: users.filter(u => u.role === 'sales_person').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all system users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold">{stats.superAdmins}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Staff</p>
                <p className="text-2xl font-bold">{stats.salesPersons}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-filter-role">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales_person">Sales Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Shop ID</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(user.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        <span>{user.role.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>{user.shopId || 'N/A'}</TableCell>
                  <TableCell>{new Date(user.createdAt!).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(user, 'impersonate')}
                        data-testid={`button-impersonate-${user.id}`}
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        Impersonate
                      </Button>
                      {user.role !== 'super_admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(user, 'ban')}
                          data-testid={`button-ban-${user.id}`}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Ban
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'ban' ? 'Ban User' : 'Impersonate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'ban' ? (
                <>
                  Are you sure you want to ban <strong>{selectedUser?.username}</strong>? 
                  This will prevent them from accessing the system.
                </>
              ) : (
                <>
                  You are about to impersonate <strong>{selectedUser?.username}</strong>. 
                  This will allow you to see the system from their perspective. All actions 
                  will be logged for security purposes.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-action">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} data-testid="button-confirm-action">
              {actionType === 'ban' ? 'Ban User' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
