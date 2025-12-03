import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TablePaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  limit,
  total,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasData = total > 0;
  const startItem = hasData ? (page - 1) * limit + 1 : 0;
  const endItem = hasData ? Math.min(page * limit, total) : 0;

  return (
    <div className="flex justify-between items-center mt-4">
      <p className="text-sm text-muted-foreground">
        {t("admin.common.showing")} {startItem}–{endItem} {t("admin.common.of")} {total}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || !hasData}
          onClick={() => onPageChange(page - 1)}
          data-testid="button-pagination-prev"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t("admin.common.previous")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || !hasData}
          onClick={() => onPageChange(page + 1)}
          data-testid="button-pagination-next"
        >
          {t("admin.common.next")}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
