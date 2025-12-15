import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/DataTable';
import { mockSales } from '@/utils/mockData';
import { useCurrency } from '@/utils/currency';

export default function RecentSales() {
  useAuth("posSales");
  const { format } = useCurrency();
  const [sales] = useState(mockSales); //todo: remove mock functionality

  const columns = [
    { key: 'id', label: 'Sale ID' },
    {
      key: 'createdAt',
      label: 'Date & Time',
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: string) => <span className="font-semibold">{format(value)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Recent Sales</h1>
        <p className="text-muted-foreground mt-1">View your recent transactions</p>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        showActions={false}
      />
    </div>
  );
}
