import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface FilterOption {
  value: string;
  label: string;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  filterType?: "text" | "select" | "none";
  filterOptions?: string[] | FilterOption[];
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  showActions?: boolean;
  renderActions?: (row: any) => React.ReactNode;
  onFilterChange?: (filters: Record<string, string>) => void;
}

export default function DataTable({
  columns,
  data,
  showActions = false,
  renderActions,
  onFilterChange,
}: DataTableProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (key: string, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilter = (key: string) => {
    const newFilters = { ...filters, [key]: draftFilters[key] || "" };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters, [key]: "" };
    const newDrafts = { ...draftFilters, [key]: "" };
    setFilters(newFilters);
    setDraftFilters(newDrafts);
    onFilterChange?.(newFilters);
  };

  return (
    <Card className="shadow-lg border-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="w-full border-collapse">
          {/* ---------- HEADER ---------- */}
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-2 border-primary/20">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="font-semibold text-foreground whitespace-nowrap px-3 py-3 relative"
                >
                  <div className="flex items-center justify-start gap-1">
                    <span>{column.label}</span>

                    {column.filterType !== "none" && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 text-gray-500 hover:text-primary"
                          >
                            {column.filterType === "text" ? (
                              <Search className="w-4 h-4" />
                            ) : (
                              <Filter className="w-4 h-4" />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="bottom"
                          className="w-56 p-3 space-y-3 shadow-lg border rounded-md"
                        >
                          {/* Search input or dropdown depending on filterType */}
                          {column.filterType === "text" && (
                            <Input
                              placeholder={`Search ${column.label}`}
                              value={draftFilters[column.key] || ""}
                              onChange={(e) =>
                                handleFilterChange(column.key, e.target.value)
                              }
                              className="text-sm"
                            />
                          )}

                          {column.filterType === "select" && (
                            <Select
                              onValueChange={(value) =>
                                handleFilterChange(
                                  column.key,
                                  value === "__all__" ? "" : value
                                )
                              }
                              value={draftFilters[column.key] || "__all__"}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Filter" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__all__">All</SelectItem>
                                {(column.filterOptions || []).map((opt) => {
                                  const isObject = typeof opt === 'object' && opt !== null;
                                  const value = isObject ? (opt as FilterOption).value : opt;
                                  const label = isObject ? (opt as FilterOption).label : opt;
                                  return (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}

                          {/* Buttons */}
                          <div className="flex justify-between pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => clearFilter(column.key)}
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => applyFilter(column.key)}
                            >
                              Apply
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </TableHead>
              ))}
              {showActions && (
                <TableHead className="text-center font-semibold text-foreground">
                  {t("admin.common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          {/* ---------- BODY ---------- */}
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center text-muted-foreground py-16"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="font-medium">No data available</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key]}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell className="text-center">
                      {renderActions && renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}