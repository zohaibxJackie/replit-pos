import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/utils/mockData';
import { useCurrency } from '@/utils/currency';

export default function POSProducts() {
  useAuth("posProducts");
  const { format } = useCurrency();
  const [products] = useState(mockProducts); //todo: remove mock functionality

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'barcode', label: 'Barcode' },
    {
      key: 'price',
      label: 'Price',
      render: (value: string) => format(value),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number, row: any) => (
        <Badge variant={value < row.lowStockThreshold ? 'destructive' : 'default'}>
          {value} units
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="text-muted-foreground mt-1">Quick product reference</p>
      </div>

      <DataTable
        columns={columns}
        data={products}
        showActions={false}
      />
    </div>
  );
}
