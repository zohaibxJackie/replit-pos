import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";

export interface CustomerFormData {
  id?: string | number;
  name: string;
  documentType: string;
  documentNumber: string;
  dob: string;
  nationality: string;
  address: string;
  postelCode: string;
  city: string;
  province: string;
  phone: string;
  email: string;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: (customer: CustomerFormData) => void;
  editingCustomer?: CustomerFormData | null;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  onCustomerAdded,
  editingCustomer,
}: CustomerFormDialogProps) {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const options = countryList().getData();

  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    documentType: "",
    documentNumber: "",
    dob: "",
    nationality: "",
    address: "",
    postelCode: "",
    city: "",
    province: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        documentType: editingCustomer.documentType || "",
        documentNumber: editingCustomer.documentNumber || "",
        dob: editingCustomer.dob || "",
        nationality: editingCustomer.nationality || "",
        address: editingCustomer.address || "",
        postelCode: editingCustomer.postelCode || "",
        city: editingCustomer.city || "",
        province: editingCustomer.province || "",
      });
    } else {
      setFormData({
        name: "",
        documentType: "",
        documentNumber: "",
        dob: "",
        nationality: "",
        address: "",
        postelCode: "",
        city: "",
        province: "",
        phone: "",
        email: "",
      });
    }
    setErrors({});
  }, [editingCustomer, open]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Only validate name and email as required
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const customerData: CustomerFormData = {
      ...formData,
      id: editingCustomer?.id || `temp_${Date.now()}`,
    };

    onCustomerAdded(customerData);
    onOpenChange(false);

    toast({
      title: editingCustomer ? "Customer Updated" : "Customer Added",
      description: `${formData.name} has been ${editingCustomer ? "updated" : "added"}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-customer-form">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <Label>Name *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => {
                handleFormChange(e);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              required
              data-testid="input-customer-name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email field */}
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleFormChange(e);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              required
              data-testid="input-email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <Label>Phone</Label>
            <Input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              data-testid="input-phone"
            />
          </div>

          {/* Document Type Dropdown */}
          <div>
            <Label>Document Type</Label>
            <ShadSelect
              value={formData.documentType}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, documentType: value }));
                setErrors((prev) => ({ ...prev, documentType: "" }));
              }}
            >
              <SelectTrigger data-testid="select-document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nid">National ID</SelectItem>
                <SelectItem value="nie">Foreigner ID (NIE)</SelectItem>
                <SelectItem value="dni">Citizen ID (DNI)</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
              </SelectContent>
            </ShadSelect>
          </div>

          {/* Document Number and DOB */}
          {[
            { label: "Document Number", name: "documentNumber", type: "text" },
            { label: "Date of Birth", name: "dob", type: "date" },
          ].map((field) => (
            <div key={field.name}>
              <Label>{field.label}</Label>
              <Input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={(e) => {
                  handleFormChange(e);
                  setErrors((prev) => ({ ...prev, [field.name]: "" }));
                }}
                data-testid={`input-${field.name}`}
              />
            </div>
          ))}

          {/* Nationality Dropdown */}
          <div>
            <Label>Nationality</Label>
            <ReactSelect
              options={options}
              value={options.find((c) => c.label === formData.nationality) || null}
              onChange={(selected: any) => {
                setFormData((prev) => ({ ...prev, nationality: selected?.label || "" }));
                setErrors((prev) => ({ ...prev, nationality: "" }));
              }}
              placeholder="Select country"
              isClearable
            />
          </div>

          {/* Address and other info */}
          {[
            { label: "Address", name: "address", type: "text" },
            { label: "Postal Code", name: "postelCode", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "Province", name: "province", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <Label>{field.label}</Label>
              <Input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData]}
                onChange={(e) => {
                  handleFormChange(e);
                  setErrors((prev) => ({ ...prev, [field.name]: "" }));
                }}
                data-testid={`input-${field.name}`}
              />
            </div>
          ))}

          {/* Submit buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-customer"
            >
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-customer">
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
