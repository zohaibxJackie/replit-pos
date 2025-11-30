import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import FormPopupModal from "@/components/ui/FormPopupModal";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Link } from "wouter";
import { useTitle } from '@/context/TitleContext';
import { useTranslation } from "react-i18next";
interface TurnItem {
  id: number;
  date: string;
  salesperson: string;
  cashSale: number;
  cardSale: number;
  creditSale: number;
  refund: number;
  totalSale: number;
  status: string;
}

export default function CloseTodayTurn() {
  useAuth("adminCloseTodayTurn");
  const { t } = useTranslation();
  const { setTitle } = useTitle();
  useEffect(() => {
    setTitle(t("admin.close_today_turn.title"));
    return () => setTitle('Business Dashboard');
  }, [setTitle]);

  // Dummy data
  const allTurns: TurnItem[] = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    date: "2025-10-23",
    salesperson: `Salesperson ${(i % 3) + 1}`,
    cashSale: Math.floor(Math.random() * 500),
    cardSale: Math.floor(Math.random() * 300),
    creditSale: Math.floor(Math.random() * 200),
    refund: Math.floor(Math.random() * 50),
    totalSale: 0,
    status: i % 2 === 0 ? "closed" : "open",
  })).map((t) => ({
    ...t,
    totalSale: t.cashSale + t.cardSale + t.creditSale - t.refund,
  }));

  // Group by salesperson
  const groupedTurns = useMemo(() => {
    const groups: Record<string, TurnItem[]> = {};
    allTurns.forEach((t) => {
      if (!groups[t.salesperson]) groups[t.salesperson] = [];
      groups[t.salesperson].push(t);
    });
    return groups;
  }, [allTurns]);

  const [viewItem, setViewItem] = useState<TurnItem | null>(null);

  return (
  <div className="space-y-8"> 

    {Object.entries(groupedTurns).map(([salesperson, turns]) => {
      // For now we show only the latest record for each salesperson
      const latestTurn = turns[turns.length - 1];

      return (
        <Card
          key={salesperson}
          className="p-6 border rounded-2xl shadow-sm bg-white"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">
              {salesperson}
            </h2>

            <div className="flex gap-2">
              <Link href="/admin/close-today-turn/123">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewItem(latestTurn)}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              </Link>

            </div>
          </div>

          <Table>
            <TableBody>
              <TableRow className="bg-muted/30 font-semibold">
                <TableCell>Close Today Shift</TableCell>
                <TableCell className="text-right">Amount (€)</TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell className="text-right">{latestTurn.date}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sale by Cash (€)</TableCell>
                <TableCell className="text-right">
                  {latestTurn.cashSale.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sale by Card (€)</TableCell>
                <TableCell className="text-right">
                  {latestTurn.cardSale.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sale by Credit (€)</TableCell>
                <TableCell className="text-right">
                  {latestTurn.creditSale.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Refund (€)</TableCell>
                <TableCell className="text-right">
                  {latestTurn.refund.toFixed(2)}
                </TableCell>
              </TableRow>

              <TableRow className="font-semibold border-t-2 border-primary/40">
                <TableCell>Total (€)</TableCell>
                <TableCell className="text-right text-primary">
                  {latestTurn.totalSale.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      );
    })}

    {/* View Modal */}
    <FormPopupModal isOpen={!!viewItem} onClose={() => setViewItem(null)}>
      {viewItem && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {viewItem.salesperson} - Turn Details
          </h2>
          <div className="space-y-1">
            <p>
              <b>Date:</b> {viewItem.date}
            </p>
            <p>
              <b>Cash Sale:</b> €{viewItem.cashSale.toFixed(2)}
            </p>
            <p>
              <b>Card Sale:</b> €{viewItem.cardSale.toFixed(2)}
            </p>
            <p>
              <b>Credit Sale:</b> €{viewItem.creditSale.toFixed(2)}
            </p>
            <p>
              <b>Refund:</b> €{viewItem.refund.toFixed(2)}
            </p>
            <p>
              <b>Total:</b> €{viewItem.totalSale.toFixed(2)}
            </p>
            <p>
              <b>Status:</b> {viewItem.status}
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setViewItem(null)}>
              Close
            </Button>

          </div>
        </div>
      )}
    </FormPopupModal>
  </div>


  );
}
