import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/DataTable';
import { mockSales } from '@/utils/mockData';

export default function SalesReport() {
  useAuth("adminSales");
  const [sales] = useState(mockSales); //todo: remove mock functionality

  const columns = [
    { key: 'id', label: 'Sale ID' },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      render: (value: string) => `$${value}`,
    },
    {
      key: 'tax',
      label: 'Tax',
      render: (value: string) => `$${value}`,
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (value: string) => `$${value}`,
    },
    {
      key: 'total',
      label: 'Total',
      render: (value: string) => <span className="font-semibold">${value}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Sales Report</h1>
        <p className="text-muted-foreground mt-1">View all transactions</p>
      </div>

      <DataTable
        columns={columns}
        data={sales}
        showActions={false}
      />
    </div>
  );
}
