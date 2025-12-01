import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
  categoryId?: string;
}

interface LowStockResponse {
  products: Product[];
}

export default function LowStockAlert() {
  const { data, isLoading } = useQuery<LowStockResponse>({
    queryKey: ['/api/products/low-stock']
  });

  const items = data?.products || [];

  return (
    <Card className="shadow-lg border-0">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Low Stock Alert</h3>
          <p className="text-sm text-muted-foreground">
            {items.length > 0 ? `${items.length} items requiring restock` : 'Items requiring restock'}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            All products are well stocked
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Current Stock</TableHead>
                <TableHead className="font-semibold">Min Required</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isOutOfStock = item.stock === 0;
                
                return (
                  <TableRow key={item.id} className="hover:bg-muted/20" data-testid={`row-lowstock-${item.id}`}>
                    <TableCell className="font-semibold">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isOutOfStock ? 'text-red-600' : 'text-amber-600'}`}>
                          {item.stock}
                        </span>
                        <span className="text-muted-foreground text-sm">units</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.lowStockThreshold} units</TableCell>
                    <TableCell>
                      <Badge 
                        variant={isOutOfStock ? 'destructive' : 'secondary'} 
                        className={`rounded-lg ${!isOutOfStock && 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
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
