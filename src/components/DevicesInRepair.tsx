import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface RepairJob {
  id: string;
  ticketNumber: string;
  deviceBrand: string;
  deviceModel: string;
  customerName: string;
  defectSummary: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface RepairJobsResponse {
  repairJobs: RepairJob[];
  pagination: {
    total: number;
  };
}

export default function DevicesInRepair() {
  const { data, isLoading } = useQuery<RepairJobsResponse>({
    queryKey: ['/api/repairs/jobs', { limit: 5 }]
  });

  const devices = data?.repairJobs || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return { variant: 'default' as const, label: 'Completed', color: 'bg-emerald-500' };
      case 'in_progress':
      case 'diagnosed':
        return { variant: 'secondary' as const, label: 'In Progress', color: 'bg-blue-500' };
      case 'waiting_parts':
        return { variant: 'secondary' as const, label: 'Waiting Parts', color: 'bg-purple-500' };
      default:
        return { variant: 'destructive' as const, label: 'Pending', color: 'bg-amber-500' };
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Devices in Repair</h3>
            <p className="text-sm text-muted-foreground">
              {data?.pagination?.total ? `${data.pagination.total} active jobs` : 'Active repair queue'}
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : devices.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No repair jobs in queue
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Ticket</TableHead>
                <TableHead className="font-semibold">Device</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Issue</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => {
                const statusConfig = getStatusConfig(device.status);
                return (
                  <TableRow key={device.id} className="hover:bg-muted/20" data-testid={`row-repair-${device.id}`}>
                    <TableCell className="font-mono text-sm font-medium">{device.ticketNumber}</TableCell>
                    <TableCell className="font-semibold">{device.deviceBrand} {device.deviceModel}</TableCell>
                    <TableCell>{device.customerName}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">{device.defectSummary}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                        <Badge variant={statusConfig.variant} className="rounded-lg">
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
