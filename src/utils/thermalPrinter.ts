export interface Receipt {
  id: string;
  date: Date;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  cashierName: string;
  currencySymbol?: string;
}

export function generateESCPOSCommands(receipt: Receipt): Uint8Array {
  const commands: number[] = [];
  const cs = receipt.currencySymbol || '$';
  
  const ESC = 0x1B;
  const GS = 0x1D;
  
  commands.push(ESC, 0x40);
  
  commands.push(ESC, 0x61, 0x01);
  commands.push(ESC, 0x45, 0x01);
  addText(commands, receipt.storeName);
  commands.push(0x0A);
  commands.push(ESC, 0x45, 0x00);
  
  commands.push(ESC, 0x61, 0x01);
  addText(commands, receipt.storeAddress);
  commands.push(0x0A);
  addText(commands, receipt.storePhone);
  commands.push(0x0A);
  commands.push(0x0A);
  
  commands.push(ESC, 0x61, 0x00);
  addText(commands, '-'.repeat(42));
  commands.push(0x0A);
  addText(commands, `Receipt #: ${receipt.id}`);
  commands.push(0x0A);
  addText(commands, `Date: ${receipt.date.toLocaleString()}`);
  commands.push(0x0A);
  if (receipt.customerName) {
    addText(commands, `Customer: ${receipt.customerName}`);
    commands.push(0x0A);
  }
  addText(commands, `Cashier: ${receipt.cashierName}`);
  commands.push(0x0A);
  addText(commands, '-'.repeat(42));
  commands.push(0x0A);
  commands.push(0x0A);
  
  receipt.items.forEach(item => {
    const itemLine = `${item.name}`;
    addText(commands, itemLine);
    commands.push(0x0A);
    const qtyPrice = `  ${item.quantity} x ${cs}${item.price.toFixed(2)}`.padEnd(30) + `${cs}${item.total.toFixed(2)}`.padStart(12);
    addText(commands, qtyPrice);
    commands.push(0x0A);
  });
  
  commands.push(0x0A);
  addText(commands, '-'.repeat(42));
  commands.push(0x0A);
  
  addText(commands, `Subtotal:`.padEnd(30) + `${cs}${receipt.subtotal.toFixed(2)}`.padStart(12));
  commands.push(0x0A);
  addText(commands, `Tax:`.padEnd(30) + `${cs}${receipt.tax.toFixed(2)}`.padStart(12));
  commands.push(0x0A);
  if (receipt.discount > 0) {
    addText(commands, `Discount:`.padEnd(30) + `-${cs}${receipt.discount.toFixed(2)}`.padStart(12));
    commands.push(0x0A);
  }
  addText(commands, '-'.repeat(42));
  commands.push(0x0A);
  
  commands.push(ESC, 0x45, 0x01);
  addText(commands, `TOTAL:`.padEnd(30) + `${cs}${receipt.total.toFixed(2)}`.padStart(12));
  commands.push(0x0A);
  commands.push(ESC, 0x45, 0x00);
  
  commands.push(0x0A);
  addText(commands, `Payment Method: ${receipt.paymentMethod}`);
  commands.push(0x0A);
  commands.push(0x0A);
  
  commands.push(ESC, 0x61, 0x01);
  addText(commands, 'Thank you for your business!');
  commands.push(0x0A);
  addText(commands, 'Please come again');
  commands.push(0x0A);
  commands.push(0x0A);
  commands.push(0x0A);
  
  commands.push(GS, 0x56, 0x00);
  
  return new Uint8Array(commands);
}

function addText(commands: number[], text: string): void {
  for (let i = 0; i < text.length; i++) {
    commands.push(text.charCodeAt(i));
  }
}

export function openCashDrawer(): Uint8Array {
  return new Uint8Array([0x1B, 0x70, 0x30, 0x37, 0x79]);
}

export async function printReceipt(receipt: Receipt, openDrawer: boolean = false): Promise<void> {
  const commands = generateESCPOSCommands(receipt);
  
  if (openDrawer) {
    const drawerCommand = openCashDrawer();
    const combined = new Uint8Array(drawerCommand.length + commands.length);
    combined.set(drawerCommand);
    combined.set(commands, drawerCommand.length);
    await sendToPrinter(combined);
  } else {
    await sendToPrinter(commands);
  }
}

async function sendToPrinter(data: Uint8Array): Promise<void> {
  try {
    const response = await fetch('http://localhost:9100/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: data,
    });
    
    if (!response.ok) {
      throw new Error('Printer not available');
    }
  } catch (error) {
    console.error('Thermal printer error:', error);
    fallbackPrint(data);
  }
}

function fallbackPrint(data: Uint8Array): void {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(data);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 0;
          padding: 10mm;
          width: 80mm;
          line-height: 1.4;
        }
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <pre>${escapeHtml(text)}</pre>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 100);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
