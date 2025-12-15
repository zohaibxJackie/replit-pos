import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTitle } from "@/context/TitleContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/DataTable";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { Eye } from "lucide-react";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { useCurrency } from "@/utils/currency";

type Wholesaler = {
  id: number;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalProducts: number;
  avgDiscount: number;
  isActive: boolean;
};

type Product = {
  name: string;
  category: string;
  price: number;
  stock: number;
  discount?: number;
};

export default function Wholesalers() {
  useAuth("adminWholesalers");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  const { format } = useCurrency();

  useEffect(() => {
    setTitle(t("admin.wholesalers.title") || "Wholesale Suppliers");
    return () => setTitle("Dashboard");
  }, [t, setTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const wholesalers: Wholesaler[] = [
    { id: 1, businessName: "TechWholesale Co.", contactPerson: "David Chen", email: "david@techwholesale.com", phone: "+1-555-0201", totalProducts: 45, avgDiscount: 15, isActive: true },
    { id: 2, businessName: "BulkTech Supplies", contactPerson: "Lisa Brown", email: "lisa@bulktech.com", phone: "+1-555-0202", totalProducts: 32, avgDiscount: 12, isActive: true },
    { id: 3, businessName: "MegaStock Electronics", contactPerson: "Robert Taylor", email: "robert@megastock.com", phone: "+1-555-0203", totalProducts: 67, avgDiscount: 20, isActive: true },
    { id: 4, businessName: "QuickSupply Inc.", contactPerson: "Emma Wilson", email: "emma@quicksupply.com", phone: "+1-555-0204", totalProducts: 28, avgDiscount: 10, isActive: false },
  ];

  const mockProducts: Record<number, Product[]> = {
    1: [
      { name: "iPhone Cases (Bulk)", category: "Accessories", price: 250, stock: 500, discount: 10 },
      { name: "Samsung Chargers (Bulk)", category: "Chargers", price: 400, stock: 1000 },
      { name: "USB-C Cables (Bulk)", category: "Cables", price: 600, stock: 2000, discount: 15 },
    ],
    2: [
      { name: "Screen Protectors (Bulk)", category: "Accessories", price: 1200, stock: 5000 },
      { name: "Power Banks (Bulk)", category: "Accessories", price: 750, stock: 300, discount: 20 },
    ],
  };

  const filtered = useMemo(() => {
    if (!search) return wholesalers;
    return wholesalers.filter(
      (w) =>
        w.businessName.toLowerCase().includes(search.toLowerCase()) ||
        w.contactPerson.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const viewProfile = (wholesaler: Wholesaler) => {
    setSelectedWholesaler(wholesaler);
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
        render: (value: string, row: Wholesaler) => (
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
        render: (value: string, row: Wholesaler) => (
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
        key: "totalProducts",
        label: "Products",
        filterType: "none" as const,
      },
      {
        key: "avgDiscount",
        label: "Avg Discount",
        filterType: "none" as const,
        render: (value: number) => `${value}%`,
      },
      
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
        renderActions={(row: Wholesaler) => (
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
        {selectedWholesaler && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{selectedWholesaler.businessName}</h2>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Person</p>
                <p className="font-semibold">{selectedWholesaler.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-semibold">{selectedWholesaler.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-semibold">{selectedWholesaler.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Available Products & Packages</h3>
              <div className="space-y-2">
                {(mockProducts[selectedWholesaler.id] || []).map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.category} • Stock: {product.stock}
                        {product.discount && <span className="ml-2 text-green-600 font-semibold">{product.discount}% OFF</span>}
                      </p>
                    </div>
                    <p className="font-bold text-lg">{format(product.price)}</p>
                  </div>
                ))}
                {(mockProducts[selectedWholesaler.id] || []).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No products listed yet</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
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
