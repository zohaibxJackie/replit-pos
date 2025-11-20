import { useState, useCallback, useMemo, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Upload, Camera } from "lucide-react";
import { BarcodeScannerDialog } from "./BarcodeScannerDialog";

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
  autoAssign: boolean;
  photos: string[];
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
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
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
  const [autoAssign, setAutoAssign] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const photoToRemove = prev[index];
      // Clean up object URL to prevent memory leak
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Revoke all object URLs on unmount
      photos.forEach(photo => URL.revokeObjectURL(photo));
    };
  }, [photos]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (customerMode === "new") {
      if (!customerName.trim()) newErrors.customerName = "Customer name is required";
      if (!customerPhone.trim()) newErrors.customerPhone = "Customer phone is required";
    } else {
      if (!selectedCustomerId) newErrors.selectedCustomerId = "Please select a customer";
    }

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
  const handleSubmit = async (e: React.FormEvent, saveType: "draft" | "assign") => {
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
        customerId: customerMode === "existing" ? selectedCustomerId : undefined,
        customerName: customerMode === "new" ? customerName : selectedCustomer?.name || "",
        customerPhone: customerMode === "new" ? customerPhone : selectedCustomer?.phone || "",
        customerDni: customerMode === "new" ? customerDni : selectedCustomer?.dni,
        deviceBrand,
        deviceModel,
        imei: imei || undefined,
        defectSummary,
        problemDescription,
        priority,
        estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
        advancePayment: advancePayment ? Number(advancePayment) : undefined,
        repairPersonId: repairPersonId || undefined,
        autoAssign: saveType === "assign" ? autoAssign : false,
        photos,
      };

      await onSubmit(data);
      handleReset();
      onClose();
      
      toast({
        title: "Success",
        description: saveType === "assign" ? "Repair job created and assigned" : "Repair job saved as draft",
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
    setCustomerMode("existing");
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
    setAutoAssign(false);
    setPhotos([]);
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
              
              {/* Customer Mode Toggle */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={customerMode === "existing" ? "default" : "outline"}
                  onClick={() => setCustomerMode("existing")}
                  data-testid="button-existing-customer"
                >
                  Existing Customer
                </Button>
                <Button
                  type="button"
                  variant={customerMode === "new" ? "default" : "outline"}
                  onClick={() => setCustomerMode("new")}
                  data-testid="button-new-customer"
                >
                  New Customer
                </Button>
              </div>

              {customerMode === "existing" ? (
                <div>
                  <Label htmlFor="customer">
                    Select Customer <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                    <SelectTrigger data-testid="select-customer">
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.selectedCustomerId && (
                    <p className="text-destructive text-xs mt-1">{errors.selectedCustomerId}</p>
                  )}
                </div>
              ) : (
                <>
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
                </>
              )}
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
                  Preferred Repair Person <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Select value={repairPersonId} onValueChange={setRepairPersonId}>
                  <SelectTrigger data-testid="select-repair-person">
                    <SelectValue placeholder="Choose repair person" />
                  </SelectTrigger>
                  <SelectContent>
                    {repairPersons.map((person) => (
                      <SelectItem key={person.id} value={person.id} disabled={!person.isAvailable}>
                        {person.name} {!person.isAvailable && "(Unavailable)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoAssign"
                  checked={autoAssign}
                  onCheckedChange={setAutoAssign}
                  data-testid="switch-auto-assign"
                />
                <Label htmlFor="autoAssign" className="cursor-pointer">
                  Auto-assign to available repair person
                </Label>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold">Photos</h3>

              <div>
                <Label htmlFor="photos">
                  Upload Photos <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <div className="mt-2">
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-4 cursor-pointer hover-elevate"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Click to upload photos</span>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                    data-testid="input-photo-upload"
                  />
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-photo-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, "draft")}
                disabled={isSubmitting}
                data-testid="button-save-draft"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, "assign")}
                disabled={isSubmitting}
                data-testid="button-save-assign"
              >
                {isSubmitting ? "Saving..." : "Save & Assign"}
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
