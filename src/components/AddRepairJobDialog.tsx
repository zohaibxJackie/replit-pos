import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { Camera, Check, ChevronsUpDown } from "lucide-react";
import { BarcodeScannerDialog } from "./BarcodeScannerDialog";
import { cn } from "@/lib/utils";

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

interface AddRepairJobData {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerDni?: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string;
  defectSummary: string;
  problemDescription: string;
  priority: "normal" | "urgent";
  estimatedCost?: number;
  advancePayment?: number;
  repairPersonId?: string;
}

interface AddRepairJobDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddRepairJobData) => Promise<void>;
  customers: Customer[];
  repairPersons: RepairPerson[];
}

// Mock phone brands
const phoneBrands = [
  "Apple", "Samsung", "Xiaomi", "OPPO", "Vivo", "Realme", 
  "OnePlus", "Huawei", "Google", "Sony", "Motorola", "Nokia", "Other"
];

export function AddRepairJobDialog({
  open,
  onClose,
  onSubmit,
  customers,
  repairPersons,
}: AddRepairJobDialogProps) {
  const { toast } = useToast();

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDni, setCustomerDni] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [imei, setImei] = useState("");
  const [defectSummary, setDefectSummary] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [advancePayment, setAdvancePayment] = useState("");
  const [repairPersonId, setRepairPersonId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [openCustomerCombo, setOpenCustomerCombo] = useState(false);
  const [openRepairPersonCombo, setOpenRepairPersonCombo] = useState(false);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Auto-fill customer details when existing customer is selected
  const handleCustomerSelect = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone);
      setCustomerDni(customer.dni || "");
    }
  }, [customers]);

  // Handle IMEI scan
  const handleIMEIScan = useCallback((scannedCode: string) => {
    setImei(scannedCode);
    setShowScanner(false);
  }, []);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!customerPhone.trim()) newErrors.customerPhone = "Customer phone is required";

    if (!deviceBrand.trim()) newErrors.deviceBrand = "Device brand is required";
    if (!deviceModel.trim()) newErrors.deviceModel = "Device model is required";
    if (!defectSummary.trim()) newErrors.defectSummary = "Defect summary is required";
    if (!problemDescription.trim()) newErrors.problemDescription = "Problem description is required";

    if (estimatedCost && (isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0)) {
      newErrors.estimatedCost = "Valid estimated cost is required";
    }

    if (advancePayment && (isNaN(Number(advancePayment)) || Number(advancePayment) < 0)) {
      newErrors.advancePayment = "Valid advance payment is required";
    }

    if (estimatedCost && advancePayment && Number(advancePayment) > Number(estimatedCost)) {
      newErrors.advancePayment = "Advance payment cannot exceed estimated cost";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data: AddRepairJobData = {
        customerId: selectedCustomerId || undefined,
        customerName,
        customerPhone,
        customerDni: customerDni || undefined,
        deviceBrand,
        deviceModel,
        imei: imei || undefined,
        defectSummary,
        problemDescription,
        priority,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        advancePayment: advancePayment ? Number(advancePayment) : undefined,
        repairPersonId: repairPersonId || undefined,
      };

      await onSubmit(data);
      handleReset();
      onClose();
      
      toast({
        title: "Success",
        description: "Repair job created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create repair job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerDni("");
    setDeviceBrand("");
    setDeviceModel("");
    setImei("");
    setDefectSummary("");
    setProblemDescription("");
    setPriority("normal");
    setEstimatedCost("");
    setAdvancePayment("");
    setRepairPersonId("");
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Repair Job</DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Customer Section */}
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">Customer Information</h3>
              
              <div>
                <Label htmlFor="customer">
                  Select Customer <span className="text-muted-foreground text-xs">(Optional - or enter details below)</span>
                </Label>
                <Popover open={openCustomerCombo} onOpenChange={setOpenCustomerCombo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCustomerCombo}
                      className="w-full justify-between"
                      data-testid="select-customer"
                    >
                      {selectedCustomerId
                        ? customers.find((c) => c.id === selectedCustomerId)?.name
                        : "Search for a customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search customers..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={`${customer.name} ${customer.phone}`}
                              onSelect={() => {
                                handleCustomerSelect(customer.id);
                                setOpenCustomerCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomerId === customer.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {customer.name} - {customer.phone}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  data-testid="input-customer-name"
                />
                {errors.customerName && (
                  <p className="text-destructive text-xs mt-1">{errors.customerName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerPhone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone number"
                    data-testid="input-customer-phone"
                  />
                  {errors.customerPhone && (
                    <p className="text-destructive text-xs mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerDni">
                    ID (DNI/Passport) <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="customerDni"
                    value={customerDni}
                    onChange={(e) => setCustomerDni(e.target.value)}
                    placeholder="DNI or Passport number"
                    data-testid="input-customer-dni"
                  />
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">Device Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deviceBrand">
                    Brand <span className="text-destructive">*</span>
                  </Label>
                  <Select value={deviceBrand} onValueChange={setDeviceBrand}>
                    <SelectTrigger data-testid="select-device-brand">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {phoneBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.deviceBrand && (
                    <p className="text-destructive text-xs mt-1">{errors.deviceBrand}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="deviceModel">
                    Model <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="deviceModel"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g., iPhone 13 Pro"
                    data-testid="input-device-model"
                  />
                  {errors.deviceModel && (
                    <p className="text-destructive text-xs mt-1">{errors.deviceModel}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="imei">
                  IMEI / Serial Number <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="imei"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="Enter or scan IMEI"
                    className="flex-1"
                    data-testid="input-imei"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowScanner(true)}
                    data-testid="button-scan-imei"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">Problem Description</h3>

              <div>
                <Label htmlFor="defectSummary">
                  Defect Summary <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="defectSummary"
                  value={defectSummary}
                  onChange={(e) => setDefectSummary(e.target.value)}
                  placeholder="e.g., Screen broken, Battery issue"
                  data-testid="input-defect-summary"
                />
                {errors.defectSummary && (
                  <p className="text-destructive text-xs mt-1">{errors.defectSummary}</p>
                )}
              </div>

              <div>
                <Label htmlFor="problemDescription">
                  Detailed Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="problemDescription"
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the problem in detail..."
                  rows={4}
                  data-testid="textarea-problem-description"
                />
                {errors.problemDescription && (
                  <p className="text-destructive text-xs mt-1">{errors.problemDescription}</p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as "normal" | "urgent")}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cost Information */}
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">Cost Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost">
                    Estimated Cost <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-estimated-cost"
                  />
                  {errors.estimatedCost && (
                    <p className="text-destructive text-xs mt-1">{errors.estimatedCost}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="advancePayment">
                    Advance Payment <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="advancePayment"
                    type="number"
                    step="0.01"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="0.00"
                    data-testid="input-advance-payment"
                  />
                  {errors.advancePayment && (
                    <p className="text-destructive text-xs mt-1">{errors.advancePayment}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">Assignment</h3>

              <div>
                <Label htmlFor="repairPerson">
                  Assign Repair Person <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Popover open={openRepairPersonCombo} onOpenChange={setOpenRepairPersonCombo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openRepairPersonCombo}
                      className="w-full justify-between"
                      data-testid="select-repair-person"
                    >
                      {repairPersonId
                        ? repairPersons.find((p) => p.id === repairPersonId)?.name
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
                          {repairPersons.map((person) => (
                            <CommandItem
                              key={person.id}
                              value={person.name}
                              onSelect={() => {
                                setRepairPersonId(person.id);
                                setOpenRepairPersonCombo(false);
                              }}
                              disabled={!person.isAvailable}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  repairPersonId === person.id ? "opacity-100" : "opacity-0"
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
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? "Saving..." : "Create Repair Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* IMEI Scanner Dialog */}
      <BarcodeScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
        onScanSuccess={handleIMEIScan}
      />
    </>
  );
}
