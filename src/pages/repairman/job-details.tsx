import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Phone,
  Smartphone,
  Calendar,
  DollarSign,
  User,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RepairmanJobDetails() {
  useAuth('repair_man');
  const { setTitle } = useTitle();
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const jobId = params.id;

  useEffect(() => {
    setTitle("Job Details");
  }, [setTitle]);

  const [status, setStatus] = useState("in_progress");
  const [notes, setNotes] = useState("");
  const [additionalCost, setAdditionalCost] = useState("");

  const job = {
    id: jobId,
    ticketNumber: "TK-001234",
    customer: "John Doe",
    phone: "+1234567890",
    email: "john.doe@email.com",
    device: "iPhone 13 Pro",
    brand: "Apple",
    model: "iPhone 13 Pro",
    imei: "353456789012345",
    issue: "Screen replacement",
    description: "Screen cracked after drop. Touch functionality partially working. Customer mentioned device was dropped from approximately 3 feet onto concrete surface.",
    priority: "urgent",
    status: "in_progress",
    dueDate: "2024-01-15",
    estimatedCost: "150.00",
    advancePayment: "50.00",
    totalPaid: "50.00",
    createdAt: "2024-01-10",
    assignedAt: "2024-01-10 14:30",
  };

  const timeline = [
    {
      date: "2024-01-10 10:15",
      title: "Job Created",
      description: "Repair job created and added to queue",
    },
    {
      date: "2024-01-10 14:30",
      title: "Job Assigned",
      description: "Job assigned to you",
    },
    {
      date: "2024-01-11 09:00",
      title: "Started Work",
      description: "Began diagnostic and screen replacement",
    },
  ];

  const notes_history = [
    {
      date: "2024-01-11 09:15",
      author: "You",
      content: "Screen removed. Digitizer connector slightly damaged. Ordered replacement part.",
    },
    {
      date: "2024-01-10 14:35",
      author: "You",
      content: "Initial inspection completed. Screen damage confirmed. Touch digitizer needs replacement.",
    },
  ];

  const handleUpdateStatus = () => {
    toast({
      title: "Status Updated",
      description: `Job status changed to ${status.replace('_', ' ')}`,
    });
  };

  const handleAddNote = () => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Note Added",
      description: "Your note has been added to the job",
    });
    setNotes("");
  };

  const handleCompleteJob = () => {
    toast({
      title: "Job Completed",
      description: "The repair job has been marked as completed",
    });
    setStatus("completed");
  };

  const getStatusColor = (stat: string) => {
    switch (stat) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/repair-man/services')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{job.ticketNumber}</h1>
            <p className="text-muted-foreground">Repair Job Details</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={getStatusColor(job.status)}
          data-testid="badge-status"
        >
          {job.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-customer-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium" data-testid="text-customer-name">{job.customer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {job.phone}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{job.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-device-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Brand</Label>
                  <p className="font-medium">{job.brand}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Model</Label>
                  <p className="font-medium">{job.model}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground">IMEI</Label>
                  <p className="font-medium font-mono">{job.imei}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-issue-details">
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Issue Summary</Label>
                <p className="font-medium">{job.issue}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Detailed Description</Label>
                <p className="text-sm">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-update-status">
            <CardHeader>
              <CardTitle>Update Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Current Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_parts">Waiting for Parts</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateStatus} className="w-full" data-testid="button-update-status">
                Update Status
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-add-note">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Add Work Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe the work performed, parts used, or any observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  data-testid="textarea-notes"
                />
              </div>
              <div>
                <Label htmlFor="additionalCost">Additional Cost (if any)</Label>
                <Input
                  id="additionalCost"
                  type="number"
                  placeholder="0.00"
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(e.target.value)}
                  data-testid="input-additional-cost"
                />
              </div>
              <Button onClick={handleAddNote} className="w-full" data-testid="button-add-note">
                Add Note
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-notes-history">
            <CardHeader>
              <CardTitle>Work Notes History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes_history.map((note, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{note.author}</span>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-job-summary">
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    {job.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{job.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Assigned</span>
                  <span className="text-sm font-medium">{job.assignedAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </span>
                  <span className="text-sm font-medium">{job.dueDate}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Cost</span>
                  <span className="text-sm font-medium">${job.estimatedCost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Advance Payment</span>
                  <span className="text-sm font-medium">${job.advancePayment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="text-sm font-medium">${job.totalPaid}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                  <span>Balance Due</span>
                  <span className="text-primary">
                    ${(parseFloat(job.estimatedCost) - parseFloat(job.totalPaid)).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-timeline">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {index !== timeline.length - 1 && (
                        <div className="h-full w-px bg-border ml-0.5 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleCompleteJob}
            className="w-full"
            size="lg"
            disabled={status === "completed"}
            data-testid="button-complete-job"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Mark as Completed
          </Button>
        </div>
      </div>
    </div>
  );
}
