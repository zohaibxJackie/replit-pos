import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useCurrency } from '@/utils/currency';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

type Period = 'week' | 'month' | 'year';

interface SalesAnalyticsResponse {
  period: string;
  stats: {
    totalSales: string;
    saleCount: number;
    avgSale: string;
  };
  dailySales: Array<{
    date: string;
    total: string;
    count: number;
  }>;
}

export default function SalesAnalyticsChart() {
  const [period, setPeriod] = useState<Period>('week');
  const { format } = useCurrency();

  const { data, isLoading } = useQuery<SalesAnalyticsResponse>({
    queryKey: ['/api/sales/analytics', { period }]
  });

  const chartData = data?.dailySales?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }),
    sales: parseFloat(item.total) || 0,
    transactions: item.count
  })) || [];

  return (
    <Card className="p-6 shadow-lg border-0 bg-card">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-bold">Sales Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.stats ? (
              <>Total: {format(parseFloat(data.stats.totalSales))} | {data.stats.saleCount} transactions</>
            ) : (
              'Revenue and transaction tracking'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
            className="rounded-xl"
            data-testid="button-period-weekly"
          >
            Weekly
          </Button>
          <Button
            size="sm"
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
            className="rounded-xl"
            data-testid="button-period-monthly"
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant={period === 'year' ? 'default' : 'outline'}
            onClick={() => setPeriod('year')}
            className="rounded-xl"
            data-testid="button-period-yearly"
          >
            Yearly
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[340px] rounded-lg" />
      ) : chartData.length === 0 ? (
        <div className="w-full h-[40px] flex items-center justify-center text-muted-foreground">
          No sales data available for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => format(value)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '1rem',
                boxShadow: '0px 8px 16px hsl(0 0% 0% / 0.1)'
              }}
              labelStyle={{ fontWeight: '600', marginBottom: '8px' }}
              formatter={(value: number) => [format(value), 'Sales']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={3}
              name="Sales Amount"
              dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
              fill="url(#salesGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
