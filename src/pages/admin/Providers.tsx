import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Printer, MapPin, Laptop } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/tablepagination";
import { TablePageSizeSelector } from "@/components/ui/tablepagesizeselector";
import { useTranslation } from "react-i18next";
import { createRoot } from "react-dom/client";
import { printElement } from "@/utils/print";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTitle } from '@/context/TitleContext';
import { useCurrency } from "@/utils/currency";

export default function Providers() {
  useAuth("adminProviders"); 
  const { toast } = useToast();
  const { t } = useTranslation();
  const { format, symbol } = useCurrency();

  const {setTitle} = useTitle();
  useEffect(() => {
    setTitle(t("admin.providers.title"));          
    return () => setTitle('Business Dashboard'); 
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ✅ Types and Locations (dynamic)
  const [types, setTypes] = useState(["Laptop", "Mobile", "Accessory"]);
  const [locations, setLocations] = useState(["Germany", "Spain", "France"]);

  // ✅ Provider Data
  const [providers, setProviders] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Provider ${i + 1}`,
      phone: `+34 346 486 83${i + 1}`,
      document: `DOC-${1000 + i}`,
      location: locations[i % locations.length],
      type: types[i % types.length],
      balance: i % 2 === 0 ? i * 10 : -i * 5,
    }))
  );

  const [filters, setFilters] = useState<Record<string, string>>({});
  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const matchName =
        !filters.name || p.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchPhone =
        !filters.phone || p.phone.toLowerCase().includes(filters.phone.toLowerCase());
      const matchLocation =
        !filters.location || p.location === filters.location;
      const matchType = !filters.type || p.type === filters.type;
      const matchBalance =
        !filters.balance ||
        (filters.balance === "Positive" && p.balance >= 0) ||
        (filters.balance === "Negative" && p.balance < 0);
      return matchName && matchPhone && matchLocation && matchType && matchBalance;
    });
  }, [providers, filters]);

  const paginatedProviders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProviders.slice(start, start + limit);
  }, [filteredProviders, page, limit]);

  // ✅ Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [viewingProvider, setViewingProvider] = useState<any | null>(null);

  // ✅ Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    document: "",
    location: "",
    type: "",
    balance: 0,
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProvider = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newProvider = {
      id: providers.length + 1,
      ...formData,
      balance: parseFloat(String(formData.balance)) || 0,
    };
    setProviders((prev) => [...prev, newProvider]);
    setIsModalOpen(false);
    toast({
      title: "Provider Added",
      description: `${newProvider.name} has been added successfully.`,
    });
  };

  // ✅ Add new type or location logic
  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;
    setTypes((prev) => [...prev, newType.trim()]);
    setNewType("");
    setIsAddTypeOpen(false);
    toast({
      title: "Type Added",
      description: `${newType} added to list.`,
    });
  };

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    setLocations((prev) => [...prev, newLocation.trim()]);
    setNewLocation("");
    setIsAddLocationOpen(false);
    toast({
      title: "Location Added",
      description: `${newLocation} added to list.`,
    });
  };

  // ✅ Print handler
  const handlePrint = async (provider: any) => {
    const container = document.createElement("div");
    container.id = "printable-provider";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <div
        id="printable-provider"
        className="p-10 bg-white text-black font-sans max-w-[8.5in] mx-auto"
        style={{ width: "8.5in", minHeight: "11in" }}
      >
        <header className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-1">Provider Information</h1>
          <p className="text-gray-600 text-sm">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </header>

        <section>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {Object.entries({
                Name: provider.name,
                Phone: provider.phone,
                Location: provider.location,
                Type: provider.type,
                "CIF/DNI/PASSPORT": provider.document,
                Balance: format(provider.balance),
              }).map(([key, value]) => (
                <tr key={key} className="border-b">
                  <td className="font-semibold text-gray-700 py-2 pr-3 w-1/3">
                    {key}
                  </td>
                  <td className="text-gray-800 py-2">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} TechFix POS System
        </footer>
      </div>
    );

    await new Promise((resolve) => setTimeout(resolve, 400));
    await printElement("printable-provider", {
      title: `Provider - ${provider.name}`,
      onAfterPrint: () => {
        root.unmount();
        document.body.removeChild(container);
      },
    });
  };

  // ✅ Columns
  const columns = [
    {
      key: "index",
      label: "#",
      filterType: "none",
      render: (_: any, __: any, index: number) => (page - 1) * limit + index + 1,
    },
    { key: "name", label: "Provider Name", filterType: "text" },
    { key: "phone", label: "Phone", filterType: "text" },
    {
      key: "location",
      label: "Location",
      filterType: "select",
      filterOptions: locations,
    },
    {
      key: "type",
      label: "Type",
      filterType: "select",
      filterOptions: types,
    },
    { key: "document", label: "CIF/DNI/PASSPORT", filterType: "text" },
    {
      key: "balance",
      label: "Balance",
      filterType: "select",
      filterOptions: ["Positive", "Negative"],
      render: (value: number) =>
        value < 0 ? (
          <Badge variant="destructive">{value.toFixed(2)}</Badge>
        ) : (
          <Badge variant="default">+{value.toFixed(2)}</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-end gap-3">

        <div className="flex items-center gap-3">
          <TablePageSizeSelector
            limit={limit}
            onChange={(val) => {
              setLimit(val);
              setPage(1);
            }}
          />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create New Provider
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={paginatedProviders}
        showActions={true}
        renderActions={(row) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-blue-100 hover:text-blue-600"
              onClick={() => setViewingProvider(row)}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-xl hover:bg-amber-100 hover:text-amber-600"
              onClick={() => handlePrint(row)}
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        )}
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      <TablePagination
        page={page}
        limit={limit}
        total={filteredProviders.length}
        onPageChange={setPage}
      />

      {/* Add Provider Modal */}
      <FormPopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <h2 className="text-2xl font-semibold mb-4">Add New Provider</h2>
        <form onSubmit={handleAddProvider} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <Label>CIF / DNI / Passport</Label>
            <Input
              name="document"
              value={formData.document}
              onChange={handleFormChange}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Select
              onValueChange={(v) => setFormData((prev) => ({ ...prev, location: v }))}
              value={formData.location}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="text-primary mt-1"
              type="button"
              onClick={() => setIsAddLocationOpen(true)}
            >
              + Add New Location
            </Button>
          </div>

          <div>
            <Label>Type</Label>
            <Select
              onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
              value={formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="text-primary mt-1"
              type="button"
              onClick={() => setIsAddTypeOpen(true)}
            >
              + Add New Type
            </Button>
          </div>

          <div>
            <Label>Opening Balance ({symbol})</Label>
            <Input
              name="balance"
              type="number"
              value={formData.balance}
              onChange={handleFormChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Provider</Button>
          </div>
        </form>
      </FormPopupModal>

      {/* Add Type Modal */}
      <FormPopupModal
        isOpen={isAddTypeOpen}
        onClose={() => setIsAddTypeOpen(false)}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Laptop className="w-5 h-5" /> Add New Type
        </h2>
        <form onSubmit={handleAddType} className="space-y-4">
          <div>
            <Label>Type Name</Label>
            <Input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Enter new type (e.g. Tablet)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddTypeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Type</Button>
          </div>
        </form>
      </FormPopupModal>

      {/* Add Location Modal */}
      <FormPopupModal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5" /> Add New Location
        </h2>
        <form onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <Label>Location Name</Label>
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter new location (e.g. Italy)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddLocationOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Location</Button>
          </div>
        </form>
      </FormPopupModal>

      {/* View Provider Modal */}
      {viewingProvider && (
        <div className="fixed !m-0 inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[700px] max-w-[95vw] relative shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-4">Provider Information</h2>
            <div className="space-y-3 text-sm text-gray-800 grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <p className="text-gray-500 font-medium">Name</p>
                <p className="font-semibold">{viewingProvider.name}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Phone</p>
                <p>{viewingProvider.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Location</p>
                <p>{viewingProvider.location}</p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Type</p>
                <p>{viewingProvider.type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 font-medium">CIF / DNI / Passport</p>
                <p>{viewingProvider.document}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 font-medium">Balance</p>
                <p
                  className={`font-semibold ${viewingProvider.balance < 0 ? "text-red-600" : "text-green-700"
                    }`}
                >
                  {format(viewingProvider.balance)}
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 no-print">
              <Button variant="outline" onClick={() => setViewingProvider(null)}>
                Close
              </Button>
              <Button onClick={() => handlePrint(viewingProvider)}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

