import { Receipt } from '@/utils/thermalPrinter';

interface MobileInvoiceProps {
  receipt: Receipt;
  amountPaid?: number;
  change?: number;
}

export function MobileInvoice({ receipt, amountPaid, change }: MobileInvoiceProps) {
  return (
    <div id="mobile-invoice" className="hidden">
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            {receipt.storeName}
          </h1>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>{receipt.storeAddress}</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>{receipt.storePhone}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>Invoice #:</span>
            <span>{receipt.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>Date:</span>
            <span>{receipt.date.toLocaleString()}</span>
          </div>
          {receipt.customerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold' }}>Customer:</span>
              <span>{receipt.customerName}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>Cashier:</span>
            <span>{receipt.cashierName}</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #333' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Item</th>
              <th style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
              <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Price</th>
              <th style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{item.name}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginBottom: '20px', borderTop: '2px solid #333', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Subtotal:</span>
            <span>${receipt.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Tax:</span>
            <span>${receipt.tax.toFixed(2)}</span>
          </div>
          {receipt.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#16a34a' }}>
              <span>Discount:</span>
              <span>-${receipt.discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '2px solid #333', fontSize: '18px', fontWeight: 'bold' }}>
            <span>TOTAL:</span>
            <span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {amountPaid !== undefined && change !== undefined && (
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '16px' }}>
              <span style={{ fontWeight: 'bold' }}>Payment Method:</span>
              <span>{receipt.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '16px' }}>
              <span style={{ fontWeight: 'bold' }}>Amount Paid:</span>
              <span>${amountPaid.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#16a34a', fontWeight: 'bold' }}>
              <span>Change:</span>
              <span>${change.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          <p style={{ margin: '5px 0' }}>Thank you for your business!</p>
          <p style={{ margin: '5px 0' }}>Please come again</p>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ margin: '5px 0', fontSize: '12px', fontWeight: 'bold' }}>Product Details:</p>
          {receipt.items.map((item, index) => (
            <div key={index} style={{ marginTop: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '14px' }}>{item.name}</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                Serial/IMEI: Available on request
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                Warranty: 1 Year Standard Warranty
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', fontSize: '11px', color: '#999', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
          <p>This is a computer-generated invoice</p>
          <p>For any queries, please contact {receipt.storePhone}</p>
        </div>
      </div>
    </div>
  );
}
