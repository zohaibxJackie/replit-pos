import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  Target,
  Award,
  Calendar,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function RepairmanReports() {
  useAuth('repair_man');
  const { setTitle } = useTitle();
  const [timeRange, setTimeRange] = useState("this_week");

  useEffect(() => {
    setTitle("Reports");
  }, [setTitle]);

  const performanceStats = [
    {
      title: "Jobs Completed",
      value: "42",
      change: "+12%",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Earnings",
      value: "$3,240",
      change: "+18%",
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Avg. Completion Time",
      value: "2.3 days",
      change: "-15%",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Success Rate",
      value: "98%",
      change: "+2%",
      icon: Target,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    },
  ];

  const completedJobs = [
    {
      date: "2024-01-20",
      ticketNumber: "TK-001230",
      customer: "Alice Cooper",
      device: "iPhone 12",
      issue: "Battery replacement",
      earnings: "$85",
      completionTime: "1 day",
      rating: 5,
    },
    {
      date: "2024-01-19",
      ticketNumber: "TK-001229",
      customer: "Bob Wilson",
      device: "Samsung S20",
      issue: "Screen repair",
      earnings: "$120",
      completionTime: "2 days",
      rating: 5,
    },
    {
      date: "2024-01-18",
      ticketNumber: "TK-001228",
      customer: "Carol Davis",
      device: "Google Pixel 5",
      issue: "Charging port fix",
      earnings: "$60",
      completionTime: "3 days",
      rating: 4,
    },
    {
      date: "2024-01-17",
      ticketNumber: "TK-001227",
      customer: "David Lee",
      device: "OnePlus 8",
      issue: "Software troubleshooting",
      earnings: "$45",
      completionTime: "1 day",
      rating: 5,
    },
    {
      date: "2024-01-16",
      ticketNumber: "TK-001226",
      customer: "Emma Thompson",
      device: "iPhone 11",
      issue: "Camera replacement",
      earnings: "$95",
      completionTime: "2 days",
      rating: 5,
    },
  ];

  const categoryBreakdown = [
    { category: "Screen Repairs", count: 18, percentage: 42, earnings: "$1,350" },
    { category: "Battery Replacements", count: 12, percentage: 29, earnings: "$780" },
    { category: "Charging Ports", count: 7, percentage: 17, earnings: "$420" },
    { category: "Water Damage", count: 3, percentage: 7, earnings: "$480" },
    { category: "Other", count: 2, percentage: 5, earnings: "$210" },
  ];

  const exportReport = () => {
    console.log("Exporting report...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Performance Reports</h1>
          <p className="text-muted-foreground">Track your work performance and earnings</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {performanceStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.color}>{stat.change}</span> from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="card-completed-jobs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Completed Jobs History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedJobs.map((job, index) => (
                <Card key={index} className="p-4" data-testid={`card-job-${index}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm" data-testid={`text-ticket-${index}`}>
                          {job.ticketNumber}
                        </span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Completed
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Award
                              key={i}
                              className={`h-3 w-3 ${
                                i < job.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{job.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.device} - {job.issue}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {job.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.completionTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.earnings}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card data-testid="card-category-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">{category.count} jobs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Earnings</span>
                    <span className="font-semibold text-foreground">{category.earnings}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-achievements">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-md">
                <div className="p-2 bg-purple-500/20 rounded-md">
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Master Technician</p>
                  <p className="text-xs text-muted-foreground">100+ jobs completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <div className="p-2 bg-green-500/20 rounded-md">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Quick Response</p>
                  <p className="text-xs text-muted-foreground">95% on-time completion</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <div className="p-2 bg-yellow-500/20 rounded-md">
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">5-Star Rating</p>
                  <p className="text-xs text-muted-foreground">Average 4.8/5 rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
