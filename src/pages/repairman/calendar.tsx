import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function RepairmanCalendar() {
  useAuth('repair_man');
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const jobsByDate: Record<string, any[]> = {
    "2024-01-15": [
      { id: "1", ticketNumber: "TK-001234", customer: "John Doe", device: "iPhone 13 Pro", status: "in_progress", priority: "urgent" },
      { id: "2", ticketNumber: "TK-001235", customer: "Jane Smith", device: "Samsung S21", status: "pending", priority: "normal" },
    ],
    "2024-01-16": [
      { id: "3", ticketNumber: "TK-001236", customer: "Mike Johnson", device: "iPad Pro", status: "waiting_parts", priority: "urgent" },
    ],
    "2024-01-18": [
      { id: "4", ticketNumber: "TK-001237", customer: "Sarah Williams", device: "OnePlus 9", status: "in_progress", priority: "normal" },
    ],
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500";
      case "in_progress":
        return "bg-blue-500";
      case "waiting_parts":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const todayJobs = jobsByDate[getDateKey(new Date().getDate())] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar View</h1>
        <p className="text-muted-foreground">Schedule and track your repair jobs</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="card-calendar">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth} data-testid="button-prev-month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} data-testid="button-next-month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {[...Array(firstDayOfMonth)].map((_, index) => (
                <div key={`empty-${index}`} className="p-2" />
              ))}

              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1;
                const dateKey = getDateKey(day);
                const dayJobs = jobsByDate[dateKey] || [];
                const isToday = day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    className={`min-h-24 p-2 border rounded-md ${
                      isToday ? "bg-primary/5 border-primary" : ""
                    }`}
                    data-testid={`calendar-day-${day}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayJobs.slice(0, 2).map((job) => (
                        <div
                          key={job.id}
                          className={`text-xs p-1 rounded ${getStatusColor(job.status)} text-white truncate`}
                          title={`${job.ticketNumber} - ${job.customer}`}
                        >
                          {job.ticketNumber}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayJobs.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card data-testid="card-today-schedule">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No jobs scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayJobs.map((job) => (
                    <Card key={job.id} className="p-3" data-testid={`card-today-job-${job.id}`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{job.ticketNumber}</span>
                          <Badge
                            variant="outline"
                            className={job.priority === "urgent" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}
                          >
                            {job.priority}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm">{job.customer}</p>
                          <p className="text-xs text-muted-foreground">{job.device}</p>
                        </div>
                        <Link href={`/repair-man/job/${job.id}`}>
                          <Button size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-legend">
            <CardHeader>
              <CardTitle>Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-sm">Waiting for Parts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm">Completed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
