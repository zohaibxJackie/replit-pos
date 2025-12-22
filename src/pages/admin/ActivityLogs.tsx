import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useTitle } from '@/context/TitleContext';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Loader2, Activity, Package, ArrowRightLeft, User, FileText } from "lucide-react";

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case 'create':
      return 'default';
    case 'update':
      return 'secondary';
    case 'delete':
      return 'destructive';
    case 'transfer':
      return 'outline';
    case 'stock_update':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case 'product':
      return <Package className="h-4 w-4" />;
    case 'stock_transfer':
      return <ArrowRightLeft className="h-4 w-4" />;
    case 'user':
      return <User className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const formatDetails = (details: string | null | undefined, t: (key: string) => string) => {
  if (!details) return '-';
  try {
    const parsed = JSON.parse(details);
    const lines: string[] = [];
    
    if (parsed.customName) lines.push(`${t('admin.activity_log.name')}: ${parsed.customName}`);
    if (parsed.barcode) lines.push(`${t('admin.activity_log.barcode')}: ${parsed.barcode}`);
    if (parsed.imei1) lines.push(`IMEI1: ${parsed.imei1}`);
    if (parsed.imei2) lines.push(`IMEI2: ${parsed.imei2}`);
    if (parsed.stock !== undefined) lines.push(`${t('admin.activity_log.stock')}: ${parsed.stock}`);
    if (parsed.previousStock !== undefined && parsed.newStock !== undefined) {
      lines.push(`${t('admin.activity_log.stock')}: ${parsed.previousStock} → ${parsed.newStock}`);
    }
    if (parsed.fromShopName && parsed.toShopName) {
      lines.push(`${t('admin.activity_log.transfer')}: ${parsed.fromShopName} → ${parsed.toShopName}`);
    }
    if (parsed.quantity) lines.push(`${t('admin.activity_log.quantity')}: ${parsed.quantity}`);
    if (parsed.salePrice) lines.push(`${t('admin.activity_log.price')}: €${parsed.salePrice}`);
    
    return lines.length > 0 ? lines.join(' | ') : t('admin.activity_log.no_details');
  } catch {
    return details;
  }
};

export default function ActivityLogs() {
  useAuth("adminActivityLogs");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  
  useEffect(() => {
    setTitle(t("admin.activity_log.title"));           
    return () => setTitle('Business Dashboard');
  }, [setTitle, t]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/notifications/activity-logs', page, limit, entityTypeFilter, actionFilter],
    queryFn: async () => {
      const params: { page: number; limit: number; entityType?: string; action?: string } = { page, limit };
      if (entityTypeFilter !== 'all') params.entityType = entityTypeFilter;
      if (actionFilter !== 'all') params.action = actionFilter;
      return api.activityLogs.getAll(params);
    },
  });

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none" as const,
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { 
      key: "createdAt", 
      label: t('admin.activity_log.date'),
      filterType: "none" as const,
      render: (log: ActivityLog) => {
        try {
          if (!log.createdAt) return '-';
          const date = new Date(log.createdAt);
          if (isNaN(date.getTime())) return '-';
          return format(date, 'dd/MM/yyyy HH:mm');
        } catch {
          return '-';
        }
      },
    },
    { 
      key: "action", 
      label: t('admin.activity_log.action'),
      filterType: "none" as const,
      render: (log: ActivityLog) => (
        <Badge variant={getActionBadgeVariant(log.action)} className="capitalize">
          {t(`admin.activity_log.actions.${log.action}`) || log.action}
        </Badge>
      ),
    },
    { 
      key: "entityType", 
      label: t('admin.activity_log.entity_type'),
      filterType: "none" as const,
      render: (log: ActivityLog) => (
        <div className="flex items-center gap-2">
          {getEntityIcon(log.entityType)}
          <span className="capitalize">{t(`admin.activity_log.entity_types.${log.entityType}`) || log.entityType}</span>
        </div>
      ),
    },
    { 
      key: "details", 
      label: t('admin.activity_log.details'),
      filterType: "none" as const,
      render: (log: ActivityLog) => (
        <span className="text-sm text-muted-foreground max-w-md truncate block" title={formatDetails(log.details, t)}>
          {formatDetails(log.details, t)}
        </span>
      ),
    },
    { 
      key: "ipAddress", 
      label: t('admin.activity_log.ip_address'),
      filterType: "none" as const,
      render: (log: ActivityLog) => log.ipAddress || '-',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{t('admin.activity_log.fetch_error')}</p>
      </div>
    );
  }

  const logs = data?.activityLogs || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center gap-3 bg-primary/10">
        <Activity className="h-6 w-6" />
        <div>
          <h2 className="text-lg font-semibold">{t('admin.activity_log.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('admin.activity_log.total_entries', { count: pagination.total })}
          </p>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <TablePageSizeSelector
          limit={limit}
          onChange={handlePageSizeChange}
        />
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('admin.activity_log.filter_entity')}:</span>
          <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
            <SelectTrigger className="w-40" data-testid="select-entity-type-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.activity_log.all')}</SelectItem>
              <SelectItem value="product">{t('admin.activity_log.entity_types.product')}</SelectItem>
              <SelectItem value="stock_transfer">{t('admin.activity_log.entity_types.stock_transfer')}</SelectItem>
              <SelectItem value="user">{t('admin.activity_log.entity_types.user')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('admin.activity_log.filter_action')}:</span>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40" data-testid="select-action-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.activity_log.all')}</SelectItem>
              <SelectItem value="create">{t('admin.activity_log.actions.create')}</SelectItem>
              <SelectItem value="update">{t('admin.activity_log.actions.update')}</SelectItem>
              <SelectItem value="delete">{t('admin.activity_log.actions.delete')}</SelectItem>
              <SelectItem value="transfer">{t('admin.activity_log.actions.transfer')}</SelectItem>
              <SelectItem value="stock_update">{t('admin.activity_log.actions.stock_update')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        showActions={false}
      />

      {pagination.totalPages > 1 && (
        <div className="mt-4">
          <TablePagination
            page={page}
            limit={limit}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('admin.activity_log.no_logs')}</p>
        </div>
      )}
    </div>
  );
}
