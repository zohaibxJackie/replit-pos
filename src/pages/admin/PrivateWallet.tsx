import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Printer } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useTitle } from '@/context/TitleContext';

interface Transaction {
    id: number;
    date: string;
    type: "Cash In" | "Cash Out";
    description: string;
    amount: number;
    addedBy: string;
}

export default function PrivateWallet() {
    useAuth("adminPrivateWallet");
    const { toast } = useToast();
    const {t} = useTranslation();
    const {setTitle} = useTitle();
    useEffect(() => {
        setTitle(t("admin.private_wallet.title"));         
        return () => setTitle('Business Dashboard'); 
      }, [setTitle]);


    // Dummy data
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: 1,
            date: "2025-10-23",
            type: "Cash In",
            description: "Added daily float",
            amount: 100,
            addedBy: "Admin",
        },
        {
            id: 2,
            date: "2025-10-23",
            type: "Cash Out",
            description: "Paid supplier",
            amount: 50,
            addedBy: "Admin",
        },
    ]);

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: "Cash In",
        description: "",
        amount: "",
    });

    const totalCashIn = transactions
        .filter((t) => t.type === "Cash In")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalCashOut = transactions
        .filter((t) => t.type === "Cash Out")
        .reduce((sum, t) => sum + t.amount, 0);

    const openingBalance = 500; // could come from backend
    const closingBalance = openingBalance + totalCashIn - totalCashOut;

    const handleAddTransaction = () => {
        const newItem: Transaction = {
            id: transactions.length + 1,
            date: new Date().toISOString().split("T")[0],
            type: formData.type as "Cash In" | "Cash Out",
            description: formData.description,
            amount: Number(formData.amount),
            addedBy: "Admin",
        };


        setTransactions([...transactions, newItem]);
        setModalOpen(false);
        setFormData({ type: "Cash In", description: "", amount: "" });

        toast({
            title: "Transaction Added",
            description: `${newItem.type} of €${newItem.amount.toFixed(
                2
            )} added successfully.`,
        });


    };

    return (
        <div className="space-y-8"> <div className="flex justify-end items-center">
            
            <div className="flex gap-2">

                <Button onClick={() => setModalOpen(true)}> <Plus className="w-4 h-4 mr-1" /> Add Transaction </Button>
            </div>
        </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <h2 className="text-sm text-gray-500">Opening Balance</h2>
                    <p className="text-xl font-semibold text-green-600">€{openingBalance.toFixed(2)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <h2 className="text-sm text-gray-500">Cash In</h2>
                    <p className="text-xl font-semibold text-blue-600">€{totalCashIn.toFixed(2)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <h2 className="text-sm text-gray-500">Cash Out</h2>
                    <p className="text-xl font-semibold text-red-600">€{totalCashOut.toFixed(2)}</p>
                </Card>
                <Card className="p-4 text-center">
                    <h2 className="text-sm text-gray-500">Closing Balance</h2>
                    <p className="text-xl font-semibold text-primary">€{closingBalance.toFixed(2)}</p>
                </Card>
            </div>

            {/* Transaction Table */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Wallet Transactions</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date/Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Added By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell>{t.date}</TableCell>
                                <TableCell
                                    className={
                                        t.type === "Cash In" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                    }
                                >
                                    {t.type}
                                </TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className="text-right">€{t.amount.toFixed(2)}</TableCell>
                                <TableCell>{t.addedBy}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Add Transaction Modal */}
            <FormPopupModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Add Transaction</h2>
                    <div className="space-y-4">
                        <div>
                            <Label>Type</Label>
                            <select
                                className="border rounded-md w-full p-2 mt-1"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Cash In">Cash In</option>
                                <option value="Cash Out">Cash Out</option>
                            </select>
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                placeholder="Enter description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Amount (€)</Label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddTransaction}>Add</Button>
                    </div>
                </div>
            </FormPopupModal>
        </div>
    )
}
