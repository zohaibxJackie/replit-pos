import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Search, UserPlus, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/lib/api";

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

const WALK_IN_CUSTOMER: CustomerOption = {
  id: "walk-in",
  name: "Walk-in Customer",
  phone: "",
  email: "",
};

interface CustomerSearchSelectProps {
  value: CustomerOption | null;
  onSelect: (customer: CustomerOption | null) => void;
  onAddNew: () => void;
  placeholder?: string;
}

export function CustomerSearchSelect({
  value,
  onSelect,
  onAddNew,
  placeholder = "Search customers...",
}: CustomerSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await api.customers.search(searchTerm, 1, 20);
      setCustomers(
        response.customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
        }))
      );
    } catch (error) {
      console.error("Failed to search customers:", error);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchCustomers(search);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, searchCustomers]);

  const handleSelect = (customer: CustomerOption) => {
    onSelect(customer.id === "walk-in" ? null : customer);
    setOpen(false);
    setSearch("");
    setCustomers([]);
    setHasSearched(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          data-testid="button-customer-search"
        >
          {value ? (
            <span className="truncate">
              {value.name}
              {value.phone && (
                <span className="text-muted-foreground ml-2 text-sm">
                  ({value.phone})
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">Walk-in Customer</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="input-customer-search"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <CommandList>
            <CommandGroup heading="Default">
              <CommandItem
                value="walk-in"
                onSelect={() => handleSelect(WALK_IN_CUSTOMER)}
                className="cursor-pointer"
                data-testid="customer-option-walk-in"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value || value.id === "walk-in" ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Walk-in Customer</span>
                </div>
              </CommandItem>
            </CommandGroup>
            {hasSearched && !isLoading && customers.length === 0 && (
              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                No customers found matching "{search}"
              </div>
            )}
            {!hasSearched && !search && (
              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                Type to search customers...
              </div>
            )}
            {customers.length > 0 && (
              <CommandGroup heading="Search Results">
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => handleSelect(customer)}
                    className="cursor-pointer"
                    data-testid={`customer-option-${customer.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === customer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      {(customer.phone || customer.email) && (
                        <span className="text-xs text-muted-foreground">
                          {customer.phone || customer.email}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setOpen(false);
                onAddNew();
              }}
              data-testid="button-add-new-customer-search"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Customer
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
