import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/utils/currency';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  lowStock?: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ 
  id, 
  name, 
  price, 
  quantity, 
  stock, 
  lowStock,
  onUpdateQuantity, 
  onRemove 
}: CartItemProps) {
  const { format } = useCurrency();
  const total = price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= stock) {
      onUpdateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-b" data-testid={`cart-item-${id}`}>
      <div className="flex-1 min-w-0">
        <div className="font-medium flex items-center gap-2 flex-wrap">
          <span className="break-words text-sm sm:text-base">{name}</span>
          {lowStock && <Badge variant="destructive" className="text-xs">Low Stock</Badge>}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">{format(price)} each</div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
          className="h-8 w-8"
          data-testid={`button-decrease-${id}`}
        >
          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-12 sm:w-16 text-center text-sm"
          min="1"
          max={stock}
          data-testid={`input-quantity-${id}`}
        />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= stock}
          className="h-8 w-8"
          data-testid={`button-increase-${id}`}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
      
      <div className="font-semibold min-w-16 sm:min-w-20 text-right text-sm sm:text-base" data-testid={`text-total-${id}`}>
        {format(total)}
      </div>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onRemove(id)}
        className="h-8 w-8"
        data-testid={`button-remove-${id}`}
      >
        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
      </Button>
    </div>
  );
}
