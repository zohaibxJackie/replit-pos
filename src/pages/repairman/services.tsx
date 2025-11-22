import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Phone,
  Smartphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function RepairmanServices() {
  useAuth("repair_man");
  const { setTitle } = useTitle();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTitle("My Services");
  }, [setTitle]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const jobs = [
    {
      id: "1",
      ticketNumber: "TK-001234",
      customer: "John Doe",
      phone: "+1234567890",
      device: "iPhone 13 Pro",
      brand: "Apple",
      model: "iPhone 13 Pro",
      imei: "353456789012345",
      issue: "Screen replacement",
      description:
        "Screen cracked after drop. Touch functionality partially working.",
      priority: "urgent",
      status: "in_progress",
      dueDate: "2024-01-15",
      estimatedCost: "150.00",
      advancePayment: "50.00",
      totalPaid: "50.00",
      createdAt: "2024-01-10",
    },
    {
      id: "2",
      ticketNumber: "TK-001235",
      customer: "Jane Smith",
      phone: "+1987654321",
      device: "Samsung Galaxy S21",
      brand: "Samsung",
      model: "Galaxy S21",
      imei: "353987654321098",
      issue: "Battery replacement",
      description: "Battery drains quickly, phone shuts down unexpectedly.",
      priority: "normal",
      status: "pending",
      dueDate: "2024-01-16",
      estimatedCost: "80.00",
      advancePayment: "30.00",
      totalPaid: "30.00",
      createdAt: "2024-01-11",
    },
    {
      id: "3",
      ticketNumber: "TK-001236",
      customer: "Mike Johnson",
      phone: "+1122334455",
      device: "iPad Pro",
      brand: "Apple",
      model: "iPad Pro 11",
      imei: "353112233445566",
      issue: "Water damage repair",
      description: "Device was dropped in water. Not powering on.",
      priority: "urgent",
      status: "waiting_parts",
      dueDate: "2024-01-14",
      estimatedCost: "200.00",
      advancePayment: "100.00",
      totalPaid: "100.00",
      createdAt: "2024-01-09",
    },
    {
      id: "4",
      ticketNumber: "TK-001237",
      customer: "Sarah Williams",
      phone: "+1555666777",
      device: "OnePlus 9 Pro",
      brand: "OnePlus",
      model: "9 Pro",
      imei: "353555666777888",
      issue: "Charging port repair",
      description: "Phone not charging. Tried multiple cables and chargers.",
      priority: "normal",
      status: "in_progress",
      dueDate: "2024-01-17",
      estimatedCost: "60.00",
      advancePayment: "20.00",
      totalPaid: "20.00",
      createdAt: "2024-01-12",
    },
    {
      id: "5",
      ticketNumber: "TK-001238",
      customer: "David Brown",
      phone: "+1999888777",
      device: "Google Pixel 6",
      brand: "Google",
      model: "Pixel 6",
      imei: "353999888777666",
      issue: "Camera lens replacement",
      description: "Rear camera lens scratched, affecting photo quality.",
      priority: "normal",
      status: "pending",
      dueDate: "2024-01-18",
      estimatedCost: "45.00",
      advancePayment: "15.00",
      totalPaid: "15.00",
      createdAt: "2024-01-13",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "waiting_parts":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent"
      ? "bg-red-500/10 text-red-500 border-red-500/20"
      : "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusCounts = {
    all: jobs.length,
    pending: jobs.filter((j) => j.status === "pending").length,
    in_progress: jobs.filter((j) => j.status === "in_progress").length,
    waiting_parts: jobs.filter((j) => j.status === "waiting_parts").length,
    completed: jobs.filter((j) => j.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Card
          className="cursor-pointer hover-elevate"
          data-testid="card-filter-all"
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">{statusCounts.all}</p>
              <p className="text-sm text-muted-foreground">All Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover-elevate"
          data-testid="card-filter-pending"
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-amber-500">
                {statusCounts.pending}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover-elevate"
          data-testid="card-filter-in-progress"
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-blue-500">
                {statusCounts.in_progress}
              </p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover-elevate"
          data-testid="card-filter-waiting"
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-orange-500">
                {statusCounts.waiting_parts}
              </p>
              <p className="text-sm text-muted-foreground">Waiting Parts</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover-elevate"
          data-testid="card-filter-completed"
        >
          <CardContent className="pt-6">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-green-500">
                {statusCounts.completed}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket, customer, or device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger
                className="w-[180px]"
                data-testid="select-priority"
              >
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No jobs found matching your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} data-testid={`card-job-${job.id}`}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="font-bold text-lg"
                        data-testid={`text-ticket-${job.id}`}
                      >
                        {job.ticketNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={getPriorityColor(job.priority)}
                        data-testid={`badge-priority-${job.id}`}
                      >
                        {job.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={getStatusColor(job.status)}
                        data-testid={`badge-status-${job.id}`}
                      >
                        {job.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-semibold mb-1">
                          Customer Information
                        </p>
                        <p
                          className="text-sm"
                          data-testid={`text-customer-${job.id}`}
                        >
                          {job.customer}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {job.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold mb-1">
                          Device Information
                        </p>
                        <p className="text-sm flex items-center gap-1">
                          <Smartphone className="h-3 w-3" />
                          {job.device}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          IMEI: {job.imei}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-1">Issue</p>
                      <p className="text-sm">{job.issue}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due:</span>
                        <span className="font-medium">{job.dueDate}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Est:</span>
                        <span className="font-medium">
                          ${job.estimatedCost}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Paid:</span>
                        <span className="font-medium">${job.totalPaid}</span>
                      </span>
                    </div>
                  </div>

                  <Link href={`/repair-man/job/${job.id}`}>
                    <Button data-testid={`button-view-${job.id}`}>
                      View & Update
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
