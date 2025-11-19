import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirmPayment: (amountPaid: number, change: number) => void;
}

export function PaymentDialog({ open, onOpenChange, total, onConfirmPayment }: PaymentDialogProps) {
  const [amountPaid, setAmountPaid] = useState('');
  const change = parseFloat(amountPaid) - total;

  useEffect(() => {
    if (open) {
      setAmountPaid(total.toFixed(2));
    }
  }, [open, total]);

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid);
    if (paid >= total) {
      onConfirmPayment(paid, change);
      onOpenChange(false);
    }
  };

  const isValid = parseFloat(amountPaid) >= total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-payment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="total-amount">Total Amount</Label>
            <div className="text-2xl font-bold text-primary" data-testid="text-payment-total">
              ${total.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount-paid">Amount Paid *</Label>
            <Input
              id="amount-paid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="Enter amount paid"
              autoFocus
              step="0.01"
              min={total}
              data-testid="input-amount-paid"
            />
          </div>

          {amountPaid && (
            <div className="space-y-2">
              <Label>Change</Label>
              <div 
                className={`text-2xl font-bold ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                data-testid="text-change-amount"
              >
                ${change >= 0 ? change.toFixed(2) : '0.00'}
              </div>
              {!isValid && (
                <p className="text-sm text-destructive">
                  Amount paid must be at least ${total.toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1"
              data-testid="button-confirm-payment"
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
