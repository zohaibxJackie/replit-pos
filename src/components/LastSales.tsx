import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Sale {
  id: string;
  total: string;
  paymentMethod: string;
  createdAt: string;
  customerId?: string;
}

interface SalesResponse {
  sales: Sale[];
  summary: {
    totalAmount: string;
    saleCount: number;
  };
}

interface LastSalesProps {
  title?: string;
  onViewAll?: () => void;
}

export default function LastSales({ title = 'Recent Sales', onViewAll }: LastSalesProps) {
  const { data, isLoading } = useQuery<SalesResponse>({
    queryKey: ['/api/sales/today']
  });

  const sales = data?.sales?.slice(0, 5) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'mobile': return 'Bank Transfer';
      default: return method;
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <div className="p-6 border-b flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {data?.summary?.saleCount ? `${data.summary.saleCount} transactions today` : 'Latest transactions'}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewAll}
          className="rounded-xl"
          data-testid="button-view-all-sales"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No sales recorded today
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Payment</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-muted/20" data-testid={`row-sale-${sale.id}`}>
                  <TableCell className="font-mono text-sm font-medium">
                    {sale.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-semibold">{getPaymentLabel(sale.paymentMethod)}</TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    ${parseFloat(sale.total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(sale.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
