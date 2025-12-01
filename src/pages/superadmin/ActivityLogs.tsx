import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTitle } from '@/context/TitleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Activity,
  User,
  FileEdit,
  Trash2,
  Settings,
  Plus
} from 'lucide-react';
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
import type { ActivityLog } from '@shared/schema';

export default function ActivityLogs() {
  useAuth("superAdminActivityLogs");
  const { setTitle } = useTitle();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    setTitle('Activity Logs');
  }, [setTitle]);
  
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      userId: 'user1',
      action: 'CREATE',
      entityType: 'shop',
      entityId: 'shop1',
      details: 'Created new shop: Tech Store Downtown',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      userId: 'user2',
      action: 'UPDATE',
      entityType: 'pricing_plan',
      entityId: 'plan1',
      details: 'Updated Gold plan pricing from $29 to $39',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '3',
      userId: 'user1',
      action: 'DELETE',
      entityType: 'user',
      entityId: 'user5',
      details: 'Deleted user account: inactive_user',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: '4',
      userId: 'user3',
      action: 'LOGIN',
      entityType: 'auth',
      entityId: null,
      details: 'User logged in successfully',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      id: '5',
      userId: 'user1',
      action: 'UPDATE',
      entityType: 'feature_flag',
      entityId: 'flag1',
      details: 'Enabled feature: advanced_analytics',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 180),
    },
  ]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      UPDATE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      DELETE: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      LOGIN: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      LOGOUT: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
    };
    return colors[action] || colors.UPDATE;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="w-4 h-4" />;
      case 'UPDATE':
        return <FileEdit className="w-4 h-4" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4" />;
      case 'LOGIN':
      case 'LOGOUT':
        return <User className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const stats = {
    total: logs.length,
    creates: logs.filter(l => l.action === 'CREATE').length,
    updates: logs.filter(l => l.action === 'UPDATE').length,
    deletes: logs.filter(l => l.action === 'DELETE').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Creates</p>
                <p className="text-2xl font-bold">{stats.creates}</p>
              </div>
              <Plus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Updates</p>
                <p className="text-2xl font-bold">{stats.updates}</p>
              </div>
              <FileEdit className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deletions</p>
                <p className="text-2xl font-bold">{stats.deletes}</p>
              </div>
              <Trash2 className="w-8 h-8 text-red-600" />
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
                placeholder="Search activity logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-logs"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full md:w-[200px]" data-testid="select-filter-action">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge className={getActionBadge(log.action)}>
                      <div className="flex items-center gap-1">
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.userId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.entityType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.details || 'No details'}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatTime(new Date(log.createdAt!))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
