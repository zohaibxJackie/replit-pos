import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, DollarSign, Phone, Mail, Wrench, User, MessageSquare } from "lucide-react";

type RepairMan = {
  id: number;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalServices: number;
  avgPrice: number;
  isActive: boolean;
};

type Service = {
  name: string;
  price: number;
  estimatedTime: number;
};

export default function RepairMen() {
  useAuth("admin");
  const { t } = useTranslation();
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle(t("admin.repair_men.title") || "Repair Service Providers");
    return () => setTitle("Dashboard");
  }, [t, setTitle]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [selectedRepairMan, setSelectedRepairMan] = useState<RepairMan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const repairMen: RepairMan[] = [
    { id: 1, businessName: "QuickFix Repairs", contactPerson: "John Doe", email: "john@quickfix.com", phone: "+1-555-0101", totalServices: 12, avgPrice: 95, isActive: true },
    { id: 2, businessName: "TechSavvy Solutions", contactPerson: "Jane Smith", email: "jane@techsavvy.com", phone: "+1-555-0102", totalServices: 8, avgPrice: 110, isActive: true },
    { id: 3, businessName: "PhoneFix Pro", contactPerson: "Mike Johnson", email: "mike@phonefix.com", phone: "+1-555-0103", totalServices: 15, avgPrice: 85, isActive: true },
    { id: 4, businessName: "Mobile Medics", contactPerson: "Sarah Williams", email: "sarah@mobilemedics.com", phone: "+1-555-0104", totalServices: 10, avgPrice: 100, isActive: false },
    { id: 5, businessName: "Expert Phone Care", contactPerson: "Michael Brown", email: "michael@expertcare.com", phone: "+1-555-0105", totalServices: 20, avgPrice: 120, isActive: true },
    { id: 6, businessName: "Rapid Repair Hub", contactPerson: "Emily Davis", email: "emily@rapidhub.com", phone: "+1-555-0106", totalServices: 14, avgPrice: 90, isActive: true },
  ];

  const mockServices: Record<number, Service[]> = {
    1: [
      { name: "Screen Replacement", price: 120, estimatedTime: 60 },
      { name: "Battery Replacement", price: 80, estimatedTime: 30 },
      { name: "Charging Port Repair", price: 60, estimatedTime: 45 },
    ],
    2: [
      { name: "Water Damage Repair", price: 150, estimatedTime: 120 },
      { name: "Camera Repair", price: 100, estimatedTime: 60 },
    ],
    3: [
      { name: "Screen Replacement", price: 100, estimatedTime: 45 },
      { name: "Battery Replacement", price: 70, estimatedTime: 30 },
      { name: "Speaker Repair", price: 90, estimatedTime: 40 },
    ],
    5: [
      { name: "Full Phone Diagnostics", price: 50, estimatedTime: 30 },
      { name: "Motherboard Repair", price: 200, estimatedTime: 180 },
      { name: "Screen Replacement", price: 130, estimatedTime: 60 },
    ],
  };

  const statusOptions = ["all", "active", "inactive"];

  const filteredRepairMen = useMemo(() => {
    let filtered = repairMen;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) =>
        selectedStatus === "active" ? r.isActive : !r.isActive
      );
    }

    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (sortBy === "services") {
      filtered = [...filtered].sort((a, b) => b.totalServices - a.totalServices);
    } else if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.avgPrice - b.avgPrice);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.avgPrice - a.avgPrice);
    }

    return filtered;
  }, [searchQuery, selectedStatus, sortBy]);

  const viewProfile = (repairMan: RepairMan) => {
    setSelectedRepairMan(repairMan);
    setIsModalOpen(true);
  };

  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleWhatsApp = (phone: string) => {
    // Remove any non-digit characters from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
          <div>
            <Input
              placeholder="Search repair providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              data-testid="input-search"
            />
          </div>
          <div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger data-testid="select-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status} data-testid={`select-item-status-${status}`}>
                    {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name" data-testid="select-item-sort-name">Name (A-Z)</SelectItem>
                <SelectItem value="services" data-testid="select-item-sort-services">Most Services</SelectItem>
                <SelectItem value="price-low" data-testid="select-item-sort-price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high" data-testid="select-item-sort-price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredRepairMen.map((repairMan) => {
          const services = mockServices[repairMan.id] || [];
          const previewServices = services.slice(0, 3);
          
          return (
            <Card key={repairMan.id} className="flex flex-col" data-testid={`repairman-card-${repairMan.id}`}>
              <CardHeader 
                className="pb-3 cursor-pointer hover-elevate rounded-t-lg"
                onClick={() => viewProfile(repairMan)}
                data-testid={`header-profile-${repairMan.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge 
                    variant={repairMan.isActive ? "default" : "secondary"}
                    className="text-xs"
                    data-testid={`badge-status-${repairMan.id}`}
                  >
                    {repairMan.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="text-xs" data-testid={`badge-services-${repairMan.id}`}>
                    <Wrench className="w-3 h-3 mr-1" />
                    {repairMan.totalServices} Services
                  </Badge>
                </div>
                <CardTitle className="text-base line-clamp-1" data-testid={`text-business-name-${repairMan.id}`}>{repairMan.businessName}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <User className="w-3 h-3" />
                  <span data-testid={`text-contact-${repairMan.id}`}>{repairMan.contactPerson}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs truncate" data-testid={`text-email-${repairMan.id}`}>{repairMan.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs" data-testid={`text-phone-${repairMan.id}`}>{repairMan.phone}</span>
                    </div>
                  </div>

                  {previewServices.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Services Preview:</p>
                      {previewServices.map((service, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5"
                          data-testid={`preview-service-${repairMan.id}-${idx}`}
                        >
                          <span className="font-medium truncate flex-1" data-testid={`preview-service-name-${repairMan.id}-${idx}`}>
                            {service.name}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            <DollarSign className="w-3 h-3 text-primary" />
                            <span className="font-bold text-primary" data-testid={`preview-service-price-${repairMan.id}-${idx}`}>
                              {service.price}
                            </span>
                          </div>
                        </div>
                      ))}
                      {services.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{services.length - 3} more services
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContact(repairMan.email);
                  }}
                  data-testid={`button-contact-${repairMan.id}`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsApp(repairMan.phone);
                  }}
                  data-testid={`button-whatsapp-${repairMan.id}`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filteredRepairMen.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-no-results">No repair providers found matching your criteria.</p>
        </div>
      )}

      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRepairMan && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" data-testid="modal-business-name">{selectedRepairMan.businessName}</h2>
              <p className="text-sm text-muted-foreground" data-testid="modal-summary">
                {selectedRepairMan.totalServices} services • Avg ${selectedRepairMan.avgPrice.toFixed(2)}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="modal-contact-info-title">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                    <p className="font-medium" data-testid="modal-contact-person">{selectedRepairMan.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium" data-testid="modal-email">{selectedRepairMan.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium" data-testid="modal-phone">{selectedRepairMan.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedRepairMan.isActive ? "default" : "secondary"} data-testid="modal-status">
                      {selectedRepairMan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4" data-testid="modal-services-title">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(mockServices[selectedRepairMan.id] || []).map((service, idx) => (
                  <Card key={idx} className="hover-elevate" data-testid={`service-card-${idx}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base" data-testid={`service-name-${idx}`}>{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span data-testid={`service-time-${idx}`}>{service.estimatedTime} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold" data-testid={`service-price-${idx}`}>{service.price.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {(mockServices[selectedRepairMan.id] || []).length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No services listed yet</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsModalOpen(false)} data-testid="button-close">
                Close
              </Button>
            </div>
          </div>
        )}
      </FormPopupModal>
    </div>
  );
}
