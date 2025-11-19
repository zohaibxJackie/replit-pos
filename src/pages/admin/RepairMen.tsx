import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { Eye, Clock, DollarSign } from "lucide-react";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Badge } from "@/components/ui/badge";

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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedRepairMan, setSelectedRepairMan] = useState<RepairMan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const repairMen: RepairMan[] = [
    { id: 1, businessName: "QuickFix Repairs", contactPerson: "John Doe", email: "john@quickfix.com", phone: "+1-555-0101", totalServices: 12, avgPrice: 95, isActive: true },
    { id: 2, businessName: "TechSavvy Solutions", contactPerson: "Jane Smith", email: "jane@techsavvy.com", phone: "+1-555-0102", totalServices: 8, avgPrice: 110, isActive: true },
    { id: 3, businessName: "PhoneFix Pro", contactPerson: "Mike Johnson", email: "mike@phonefix.com", phone: "+1-555-0103", totalServices: 15, avgPrice: 85, isActive: true },
    { id: 4, businessName: "Mobile Medics", contactPerson: "Sarah Williams", email: "sarah@mobilemedics.com", phone: "+1-555-0104", totalServices: 10, avgPrice: 100, isActive: false },
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
  };

  const filtered = useMemo(() => {
    if (!search) return repairMen;
    return repairMen.filter(
      (r) =>
        r.businessName.toLowerCase().includes(search.toLowerCase()) ||
        r.contactPerson.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const viewProfile = (repairMan: RepairMan) => {
    setSelectedRepairMan(repairMan);
    setIsModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        filterType: "none" as const,
        render: (_: any, __: any, idx: number) => (page - 1) * limit + idx + 1,
      },
      { 
        key: "businessName", 
        label: "Business Name", 
        filterType: "none" as const,
        render: (value: string, row: RepairMan) => (
          <button 
            onClick={() => viewProfile(row)} 
            className="text-primary hover:underline font-medium text-left"
            data-testid={`link-business-${row.id}`}
          >
            {value}
          </button>
        )
      },
      { 
        key: "contactPerson", 
        label: "Contact Person", 
        filterType: "none" as const,
        render: (value: string, row: RepairMan) => (
          <button 
            onClick={() => viewProfile(row)} 
            className="text-primary hover:underline text-left"
            data-testid={`link-contact-${row.id}`}
          >
            {value}
          </button>
        )
      },
      { key: "email", label: "Email", filterType: "none" as const },
      { key: "phone", label: "Phone", filterType: "none" as const },
      {
        key: "totalServices",
        label: "Services",
        filterType: "none" as const,
      },
      {
        key: "avgPrice",
        label: "Avg Price",
        filterType: "none" as const,
        render: (value: number) => `$${value.toFixed(2)}`,
      }
    ],
    [page, limit]
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-end">

        <div className="flex items-center gap-3">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={paginated}
        showActions
        renderActions={(row: RepairMan) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => viewProfile(row)} data-testid={`button-view-${row.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              
            </Button>
          </div>
        )}
        onFilterChange={() => { }}
      />
      <TablePagination page={page} limit={limit} total={filtered.length} onPageChange={setPage} />

      <FormPopupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRepairMan && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedRepairMan.businessName}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedRepairMan.totalServices} services • Avg ${selectedRepairMan.avgPrice.toFixed(2)}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contact Person</p>
                    <p className="font-medium">{selectedRepairMan.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{selectedRepairMan.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{selectedRepairMan.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant={selectedRepairMan.isActive ? "default" : "secondary"}>
                      {selectedRepairMan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(mockServices[selectedRepairMan.id] || []).map((service, idx) => (
                  <Card key={idx} className="hover-elevate">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{service.estimatedTime} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-2xl font-bold">{service.price.toFixed(2)}</span>
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
