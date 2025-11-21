import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useToast } from "@/hooks/use-toast";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Plus,
  Eye,
  Edit,
  UserPlus,
  Phone,
  MessageCircle,
  Printer,
  MoreHorizontal,
  Search,
  X,
  Check,
  ChevronsUpDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddRepairJobDialog } from "@/components/AddRepairJobDialog";
import { RepairJobTicket } from "@/components/RepairJobTicket";
import { printElement } from "@/utils/print";

// Interfaces
interface RepairJob {
  id: string;
  ticketNumber: string;
  createdAt: Date;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  defectSummary: string;
  problemDescription: string;
  customerName: string;
  customerPhone: string;
  customerDni?: string;
  status: "pending" | "assigned" | "in_progress" | "waiting_parts" | "completed" | "delivered" | "cancelled";
  priority: "normal" | "urgent";
  repairPersonId?: string;
  repairPersonName?: string;
  isRepairPersonAvailable?: boolean;
  estimatedCost?: number;
  advancePayment?: number;
  totalPaid?: number;
  shopId: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  dni?: string;
}

interface RepairPerson {
  id: string;
  name: string;
  isAvailable: boolean;
}

// Status badge configuration
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  assigned: { label: "Assigned", variant: "outline" },
  in_progress: { label: "In Progress", variant: "default" },
  waiting_parts: { label: "Waiting Parts", variant: "secondary" },
  completed: { label: "Completed", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export default function RepairBook() {
  useAuth("admin");
  const { toast } = useToast();
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle(t("admin.repair_book.title") || "Repair Book");
    return () => setTitle("Business Dashboard");
  }, [setTitle, t]);

  // Mock data - Replace with actual API calls
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>(
    Array.from({ length: 25 }, (_, i) => ({
      id: `job-${i + 1}`,
      ticketNumber: `TKT${String(i + 1).padStart(5, "0")}`,
      createdAt: new Date(2025, 10, 20 - i, 14, 23),
      deviceBrand: i % 3 === 0 ? "Apple" : i % 3 === 1 ? "Samsung" : "Xiaomi",
      deviceModel: i % 3 === 0 ? "iPhone 13 Pro" : i % 3 === 1 ? "Galaxy S22 Ultra" : "Mi 11",
      imei: `35897312345612${i}`,
      defectSummary: i % 2 === 0 ? "Screen broken" : "Battery draining fast",
      problemDescription: i % 2 === 0 
        ? "Screen shattered after a fall, needs replacement. Touch is not working properly."
        : "Battery drains within 2 hours of full charge. Phone gets very hot during use.",
      customerName: `Customer ${i + 1}`,
      customerPhone: `+1-555-010${i}`,
      customerDni: `PK12345${i}`,
      status: ["pending", "assigned", "in_progress", "waiting_parts", "completed", "delivered"][i % 6] as any,
      priority: i % 4 === 0 ? "urgent" : "normal",
      repairPersonId: i % 2 === 0 ? `person-${(i % 3) + 1}` : undefined,
      repairPersonName: i % 2 === 0 ? `Technician ${(i % 3) + 1}` : undefined,
      isRepairPersonAvailable: i % 3 !== 0,
      estimatedCost: 100 + i * 10,
      advancePayment: i % 2 === 0 ? 50 : 0,
      totalPaid: i % 2 === 0 ? 50 : 0,
      shopId: "shop-1",
    }))
  );

  const mockCustomers: Customer[] = Array.from({ length: 10 }, (_, i) => ({
    id: `customer-${i + 1}`,
    name: `Customer ${i + 1}`,
    phone: `+1-555-010${i}`,
    dni: `PK12345${i}`,
  }));

  const mockRepairPersons: RepairPerson[] = Array.from({ length: 5 }, (_, i) => ({
    id: `person-${i + 1}`,
    name: `Technician ${i + 1}`,
    isAvailable: i % 3 !== 0,
  }));

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewJob, setViewJob] = useState<RepairJob | null>(null);
  const [editJob, setEditJob] = useState<RepairJob | null>(null);
  const [printJob, setPrintJob] = useState<RepairJob | null>(null);
  const [assignJob, setAssignJob] = useState<RepairJob | null>(null);
  const [selectedRepairPerson, setSelectedRepairPerson] = useState<string>("");
  const [openAssignCombo, setOpenAssignCombo] = useState(false);

  // Filtered and paginated data
  const filteredJobs = useMemo(() => {
    return repairJobs.filter((job) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        job.ticketNumber.toLowerCase().includes(searchLower) ||
        job.customerName.toLowerCase().includes(searchLower) ||
        job.customerPhone.includes(searchQuery) ||
        job.deviceModel.toLowerCase().includes(searchLower) ||
        job.imei?.includes(searchQuery) ||
        job.defectSummary.toLowerCase().includes(searchLower);

      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesPriority = !filters.priority || job.priority === filters.priority;
      const matchesRepairPerson = !filters.repairPerson || 
        job.repairPersonName?.toLowerCase().includes(filters.repairPerson.toLowerCase());

      return matchesSearch && matchesStatus && matchesRepairPerson && matchesPriority;
    });
  }, [repairJobs, searchQuery, filters]);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredJobs.slice(start, start + limit);
  }, [filteredJobs, page, limit]);

  // Handlers
  const handleAddJob = async (data: any) => {
    const newJob: RepairJob = {
      id: `job-${Date.now()}`,
      ticketNumber: `TKT${String(repairJobs.length + 1).padStart(5, "0")}`,
      createdAt: new Date(),
      deviceBrand: data.deviceBrand,
      deviceModel: data.deviceModel,
      imei: data.imei,
      defectSummary: data.defectSummary,
      problemDescription: data.problemDescription,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerDni: data.customerDni,
      status: data.repairPersonId ? "assigned" : "pending",
      priority: data.priority,
      repairPersonId: data.repairPersonId,
      repairPersonName: data.repairPersonId ? mockRepairPersons.find(p => p.id === data.repairPersonId)?.name : undefined,
      estimatedCost: data.estimatedCost,
      advancePayment: data.advancePayment || 0,
      totalPaid: data.advancePayment || 0,
      shopId: "shop-1",
    };

    setRepairJobs(prev => [newJob, ...prev]);
    
    toast({
      title: "Repair Job Created",
      description: `Job ${newJob.ticketNumber} has been created successfully`,
    });
  };

  const handleEditJob = async (data: any) => {
    if (!editJob) return;

    setRepairJobs(prev =>
      prev.map(job =>
        job.id === editJob.id
          ? {
              ...job,
              deviceBrand: data.deviceBrand,
              deviceModel: data.deviceModel,
              imei: data.imei,
              defectSummary: data.defectSummary,
              problemDescription: data.problemDescription,
              priority: data.priority,
              estimatedCost: data.estimatedCost,
              advancePayment: data.advancePayment,
            }
          : job
      )
    );

    setEditJob(null);

    toast({
      title: "Job Updated",
      description: "Repair job has been updated successfully",
    });
  };

  const handleAssignJob = (jobId: string, repairPersonId: string) => {
    const person = mockRepairPersons.find(p => p.id === repairPersonId);
    
    setRepairJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              repairPersonId,
              repairPersonName: person?.name,
              status: "assigned" as any,
              isRepairPersonAvailable: person?.isAvailable,
            }
          : job
      )
    );

    setAssignJob(null);

    toast({
      title: "Job Assigned",
      description: `Job assigned to ${person?.name}`,
    });
  };

  const handlePrint = async (job: RepairJob) => {
    setPrintJob(job);
    
    // Wait for next tick to ensure the ticket is rendered
    setTimeout(async () => {
      const container = document.getElementById("repair-ticket-print");
      if (container) {
        await printElement("repair-ticket-print", {
          title: `Repair Ticket - ${job.ticketNumber}`,
          onAfterPrint: () => setPrintJob(null),
        });
      }
    }, 100);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleBulkStatusChange = (newStatus: string) => {
    if (selectedRows.size === 0) {
      toast({
        title: "No Jobs Selected",
        description: "Please select jobs to change status",
        variant: "destructive",
      });
      return;
    }

    setRepairJobs(prev => 
      prev.map(job => 
        selectedRows.has(job.id) 
          ? { ...job, status: newStatus as any }
          : job
      )
    );

    setSelectedRows(new Set());
    
    toast({
      title: "Status Updated",
      description: `${selectedRows.size} job(s) status changed to ${newStatus}`,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Add all current page IDs to selection (merge, don't replace)
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        paginatedJobs.forEach(job => newSet.add(job.id));
        return newSet;
      });
    } else {
      // Remove all current page IDs from selection
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        paginatedJobs.forEach(job => newSet.delete(job.id));
        return newSet;
      });
    }
  };


  // Check if all current page jobs are selected
  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedJobs.length === 0) return false;
    return paginatedJobs.every(job => selectedRows.has(job.id));
  }, [paginatedJobs, selectedRows]);

  const handleSelectRow = (jobId: string, checked: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  // DataTable columns (without checkbox - we'll add it separately)
  const columns = [
    {
      key: "ticketNumber",
      label: "#",
      filterType: "none" as const,
      render: (val: string) => <span className="font-mono text-sm">{val}</span>,
    },
    {
      key: "createdAt",
      label: "Date & Time",
      filterType: "none" as const,
      render: (val: Date) => <span className="text-sm">{format(val, "dd/MM/yyyy HH:mm")}</span>,
    },
    {
      key: "device",
      label: "Brand/Model",
      filterType: "none" as const,
      render: (_: any, row: RepairJob) => (
        <div className="text-sm">
          <div>{row.deviceBrand}</div>
          <div className="text-muted-foreground text-xs">{row.deviceModel}</div>
        </div>
      ),
    },
    {
      key: "imei",
      label: "IMEI/Serial",
      filterType: "none" as const,
      render: (val: string) => <span className="text-sm font-mono">{val || "N/A"}</span>,
    },
    {
      key: "defectSummary",
      label: "Defect",
      filterType: "none" as const,
      render: (_: any, row: RepairJob) => (
        <div className="text-sm max-w-[200px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate">{row.defectSummary}</div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">
                  <p className="font-semibold">{row.defectSummary}</p>
                  <p className="text-xs mt-1">{row.problemDescription}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
      filterType: "none" as const,
      render: (val: string) => <span className="text-sm">{val}</span>,
    },
    {
      key: "customerPhone",
      label: "Contact",
      filterType: "none" as const,
      render: (val: string) => <span className="text-sm font-mono">{val}</span>,
    },
    {
      key: "customerDni",
      label: "ID",
      filterType: "none" as const,
      render: (val: string) => <span className="text-sm">{val || "N/A"}</span>,
    },
    {
      key: "priority",
      label: "Priority",
      filterType: "select" as const,
      filterOptions: ["normal", "urgent"],
      render: (val: string) => (
        <Badge variant={val === "urgent" ? "destructive" : "secondary"}>
          {val === "urgent" ? "URGENT" : "NORMAL"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      filterType: "select" as const,
      filterOptions: ["pending", "assigned", "in_progress", "waiting_parts", "completed", "delivered", "cancelled"],
      render: (val: string) => (
        <Badge variant={statusConfig[val]?.variant || "outline"}>
          {statusConfig[val]?.label || val}
        </Badge>
      ),
    },
    {
      key: "repairPersonName",
      label: "Repair Person",
      filterType: "text" as const,
      render: (_: any, row: RepairJob) => (
        <div className="text-sm">
          {row.repairPersonName ? (
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  row.isRepairPersonAvailable ? "bg-green-500" : "bg-gray-400"
                }`}
                title={row.isRepairPersonAvailable ? "Available" : "Unavailable"}
              />
              {row.repairPersonName}
            </div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket, customer, phone, IMEI, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-job">
          <Plus className="w-4 h-4 mr-2" />
          Add Repair Job
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="bg-primary/10 p-3 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedRows.size} job(s) selected
          </span>
          <div className="flex gap-2">
            <Select onValueChange={handleBulkStatusChange}>
              <SelectTrigger className="w-48" data-testid="select-bulk-status">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Mark as Pending</SelectItem>
                <SelectItem value="assigned">Mark as Assigned</SelectItem>
                <SelectItem value="in_progress">Mark as In Progress</SelectItem>
                <SelectItem value="waiting_parts">Mark as Waiting Parts</SelectItem>
                <SelectItem value="completed">Mark as Completed</SelectItem>
                <SelectItem value="delivered">Mark as Delivered</SelectItem>
                <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
              data-testid="button-clear-selection"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* DataTable with custom first column for checkboxes */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary/5 to-accent/5 border-b-2 border-primary/20">
              <tr>
                <th className="p-3 text-left w-12">
                  <Checkbox
                    checked={isAllCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-3 text-left font-semibold text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.filterType !== "none" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0 text-gray-500 hover:text-primary"
                            >
                              {col.filterType === "text" ? (
                                <Search className="w-4 h-4" />
                              ) : (
                                <Filter className="w-4 h-4" />
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-56 p-3 space-y-3">
                            {col.filterType === "text" && (
                              <Input
                                placeholder={`Search ${col.label}`}
                                value={filters[col.key] || ""}
                                onChange={(e) => {
                                  setFilters(prev => ({ ...prev, [col.key]: e.target.value }));
                                  setPage(1);
                                }}
                                className="text-sm"
                              />
                            )}
                            {col.filterType === "select" && col.filterOptions && (
                              <Select
                                value={filters[col.key] || "__all__"}
                                onValueChange={(value) => {
                                  setFilters(prev => ({ ...prev, [col.key]: value === "__all__" ? "" : value }));
                                  setPage(1);
                                }}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__all__">All</SelectItem>
                                  {col.filterOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <div className="flex justify-between pt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, [col.key]: "" }));
                                  setPage(1);
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </th>
                ))}
                <th className="p-3 text-right font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="p-8 text-center text-muted-foreground">
                    No repair jobs found
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((row, index) => (
                  <tr key={row.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                        data-testid={`checkbox-row-${row.id}`}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="p-3">
                        {col.render ? col.render(row[col.key as keyof RepairJob], row) : String(row[col.key as keyof RepairJob] ?? '')}
                      </td>
                    ))}
                    <td className="p-3 text-right">
                      <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-actions-${row.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewJob(row)} data-testid={`action-view-${row.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditJob(row)} data-testid={`action-edit-${row.id}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssignJob(row)} data-testid={`action-assign-${row.id}`}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign/Reassign
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCall(row.customerPhone)} data-testid={`action-call-${row.id}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleWhatsApp(row.customerPhone)} data-testid={`action-whatsapp-${row.id}`}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlePrint(row)} data-testid={`action-print-${row.id}`}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Ticket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <TablePageSizeSelector limit={limit} onChange={setLimit} />
        <TablePagination
          page={page}
          limit={limit}
          total={filteredJobs.length}
          onPageChange={setPage}
        />
      </div>

      {/* Add Job Dialog */}
      <AddRepairJobDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddJob}
        customers={mockCustomers}
        repairPersons={mockRepairPersons}
      />

      {/* View Job Dialog */}
      <Dialog open={!!viewJob} onOpenChange={() => setViewJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Repair Job Details - {viewJob?.ticketNumber}</DialogTitle>
          </DialogHeader>
          {viewJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Date:</span> {format(viewJob.createdAt, "dd/MM/yyyy HH:mm")}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  <Badge variant={statusConfig[viewJob.status]?.variant}>
                    {statusConfig[viewJob.status]?.label}
                  </Badge>
                </div>
                <div>
                  <span className="font-semibold">Customer:</span> {viewJob.customerName}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {viewJob.customerPhone}
                </div>
                <div>
                  <span className="font-semibold">ID:</span> {viewJob.customerDni || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Priority:</span>{" "}
                  {viewJob.priority === "urgent" ? (
                    <Badge variant="destructive">URGENT</Badge>
                  ) : (
                    "Normal"
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Device Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Brand:</span> {viewJob.deviceBrand}
                  </div>
                  <div>
                    <span className="font-semibold">Model:</span> {viewJob.deviceModel}
                  </div>
                  <div>
                    <span className="font-semibold">IMEI:</span> {viewJob.imei || "N/A"}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Problem Description</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Summary:</span> {viewJob.defectSummary}
                  </div>
                  <div>
                    <span className="font-semibold">Details:</span>
                    <p className="text-muted-foreground mt-1">{viewJob.problemDescription}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Cost Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {viewJob.estimatedCost && (
                    <div>
                      <span className="font-semibold">Estimated Cost:</span> ${viewJob.estimatedCost}
                    </div>
                  )}
                  {viewJob.advancePayment && viewJob.advancePayment > 0 && (
                    <div>
                      <span className="font-semibold">Advance Paid:</span> ${viewJob.advancePayment}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewJob(null)}>
                  Close
                </Button>
                <Button onClick={() => handlePrint(viewJob)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      {editJob && (
        <AddRepairJobDialog
          open={!!editJob}
          onClose={() => setEditJob(null)}
          onSubmit={handleEditJob}
          customers={mockCustomers}
          repairPersons={mockRepairPersons}
        />
      )}

      {/* Assign/Reassign Dialog */}
      <Dialog open={!!assignJob} onOpenChange={() => {
        setAssignJob(null);
        setSelectedRepairPerson("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign/Reassign Repair Person</DialogTitle>
          </DialogHeader>
          {assignJob && (
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-semibold">Job: {assignJob.ticketNumber}</p>
                <p className="text-muted-foreground">{assignJob.deviceBrand} {assignJob.deviceModel}</p>
                {assignJob.repairPersonName && (
                  <p className="mt-2">
                    Currently assigned to: <span className="font-semibold">{assignJob.repairPersonName}</span>
                  </p>
                )}
              </div>

              <div>
                <Label>Select Repair Person</Label>
                <Popover open={openAssignCombo} onOpenChange={setOpenAssignCombo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAssignCombo}
                      className="w-full justify-between"
                      data-testid="select-assign-person"
                    >
                      {selectedRepairPerson
                        ? mockRepairPersons.find((p) => p.id === selectedRepairPerson)?.name
                        : "Search for a repair person..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search repair persons..." />
                      <CommandList>
                        <CommandEmpty>No repair person found.</CommandEmpty>
                        <CommandGroup>
                          {mockRepairPersons.map((person) => (
                            <CommandItem
                              key={person.id}
                              value={person.name}
                              onSelect={() => {
                                setSelectedRepairPerson(person.id);
                                setOpenAssignCombo(false);
                              }}
                              disabled={!person.isAvailable}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRepairPerson === person.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <span className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    person.isAvailable ? "bg-green-500" : "bg-gray-400"
                                  }`}
                                />
                                {person.name} {!person.isAvailable && "(Unavailable)"}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAssignJob(null);
                    setSelectedRepairPerson("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedRepairPerson && handleAssignJob(assignJob.id, selectedRepairPerson)}
                  disabled={!selectedRepairPerson}
                  data-testid="button-confirm-assign"
                >
                  Assign
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden print container */}
      {printJob && (
        <div id="repair-ticket-print" className="hidden">
          <RepairJobTicket
            job={{
              ...printJob,
              createdAt: printJob.createdAt,
            } as any}
            shopInfo={{
              name: "My Repair Shop",
              address: "123 Main St, City, Country",
              phone: "+1-555-0100",
            }}
          />
        </div>
      )}
    </div>
  );
}
