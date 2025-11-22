import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function RepairmanDashboard() {
  useAuth('repair_man');
  const [isAvailable, setIsAvailable] = useState(true);

  const stats = [
    {
      title: "Pending Jobs",
      value: "5",
      icon: Clock,
      trend: "+2",
      trendLabel: "from yesterday",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "In Progress",
      value: "3",
      icon: Wrench,
      trend: "+1",
      trendLabel: "since this morning",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed Today",
      value: "8",
      icon: CheckCircle2,
      trend: "+8",
      trendLabel: "completed today",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Earnings",
      value: "$425",
      icon: DollarSign,
      trend: "+$125",
      trendLabel: "this week",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const recentJobs = [
    {
      id: "1",
      ticketNumber: "TK-001234",
      customer: "John Doe",
      device: "iPhone 13 Pro",
      issue: "Screen replacement",
      priority: "urgent",
      status: "in_progress",
      dueDate: "2024-01-15",
      estimatedCost: "$150",
    },
    {
      id: "2",
      ticketNumber: "TK-001235",
      customer: "Jane Smith",
      device: "Samsung Galaxy S21",
      issue: "Battery replacement",
      priority: "normal",
      status: "pending",
      dueDate: "2024-01-16",
      estimatedCost: "$80",
    },
    {
      id: "3",
      ticketNumber: "TK-001236",
      customer: "Mike Johnson",
      device: "iPad Pro",
      issue: "Water damage repair",
      priority: "urgent",
      status: "waiting_parts",
      dueDate: "2024-01-14",
      estimatedCost: "$200",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your repair queue</p>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="availability" className="text-sm font-medium">
              Availability Status
            </Label>
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
              data-testid="switch-availability"
            />
            <Badge
              variant={isAvailable ? "default" : "secondary"}
              className={isAvailable ? "bg-green-500" : ""}
              data-testid={`badge-status-${isAvailable ? 'available' : 'unavailable'}`}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.color}>{stat.trend}</span> {stat.trendLabel}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="card-recent-jobs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Card key={job.id} className="p-4" data-testid={`card-job-${job.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm" data-testid={`text-ticket-${job.id}`}>
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
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium" data-testid={`text-customer-${job.id}`}>
                          {job.customer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {job.device} - {job.issue}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {job.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.estimatedCost}
                        </span>
                      </div>
                    </div>
                    <Link href={`/repair-man/job/${job.id}`}>
                      <Button size="sm" data-testid={`button-view-${job.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
            <Link href="/repair-man/services">
              <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-jobs">
                View All Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/repair-man/services">
              <Button variant="outline" className="w-full justify-start" data-testid="button-my-services">
                <Wrench className="h-4 w-4 mr-2" />
                My Services
              </Button>
            </Link>
            <Link href="/repair-man/reports">
              <Button variant="outline" className="w-full justify-start" data-testid="button-reports">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Link>
            <Link href="/repair-man/calendar">
              <Button variant="outline" className="w-full justify-start" data-testid="button-calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </Link>
            <Link href="/repair-man/parts-inventory">
              <Button variant="outline" className="w-full justify-start" data-testid="button-parts">
                <Package className="h-4 w-4 mr-2" />
                Parts Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-alerts">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Important Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">2 urgent jobs require immediate attention</p>
              <p className="text-xs text-muted-foreground mt-1">
                TK-001234 and TK-001236 are marked as urgent priority
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
            <Package className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">1 job waiting for parts</p>
              <p className="text-xs text-muted-foreground mt-1">
                TK-001236 is on hold pending part arrival
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
