# Wholesaler Role Features

## Overview
The wholesaler role is designed for businesses that supply mobile phones and accessories in bulk to shop owners and sales persons. Wholesalers manage their product listings, receive and process orders, and track their customer relationships.

---

## Core Features

### 1. Dashboard
- Overview of business metrics and key performance indicators
- Quick access to pending orders
- Product inventory summary
- Recent activity feed

### 2. Product Management

#### Product Listings
Wholesalers can add and manage two types of products:

##### Mobile Phones
- **Brand Selection**: Choose from a predefined list of mobile brands (e.g., Apple, Samsung, Xiaomi, OPPO, Vivo, etc.)
  - Searchable dropdown interface for easy brand selection
  - Brands are managed from the backend
- **Model Selection**: Select specific mobile models based on the chosen brand
  - Autocomplete functionality with suggestions
  - Models are filtered by the selected brand
  - Model list is managed from the backend
- **Pricing**: Set both purchase price and selling price
- **Stock Management**: Track available quantity and minimum stock levels
- **SKU**: Assign unique SKU codes for inventory tracking
- **Description**: Add optional product descriptions

##### Accessories
- **Brand Selection**: Choose from a predefined list of accessory brands
  - Same searchable dropdown interface as mobiles
  - Brands are managed from the backend
- **Manual Name Entry**: Enter product names manually (e.g., "PowerBank 20000mAh Fast Charging", "USB-C to Lightning Cable 2m")
  - Flexible naming allows for custom product descriptions
- **Pricing**: Set both purchase price and selling price
- **Stock Management**: Track available quantity and minimum stock levels
- **SKU**: Assign unique SKU codes for inventory tracking
- **Description**: Add optional product descriptions

#### Product Features
- Search and filter products by name, SKU, or brand
- Filter by category (Mobile or Accessory)
- View inventory statistics (mobile count, accessory count, low stock alerts)
- Track inventory value
- Low stock alerts and warnings
- Edit existing products

#### No Supplier Management
- Wholesalers add products manually without needing to manage suppliers
- Direct product entry streamlines the workflow for wholesalers who source their own inventory

### 3. Orders Management

#### Unified Orders View
All orders (from both shop owners and sales persons) are consolidated in one place since they share the same attributes:

##### Order Types
1. **Purchase Orders** (from Shop Owners)
   - Orders placed by shop owners through the marketplace
   - Display shop name, contact person, and shop details
   
2. **Sales Person Orders**
   - Direct orders from sales persons for their customers
   - Display sales person name and contact information

#### Order Management Features
- View all orders in a unified interface
- Filter by order status:
  - Pending
  - Approved
  - Rejected
  - Fulfilled
- Filter by order type:
  - Shop Orders (Purchase Orders)
  - Sales Person Orders
- Order details include:
  - Order number
  - Customer/Shop/Sales person information
  - Contact details (phone, WhatsApp, email, address)
  - Order items with quantities and prices
  - Total amount
  - Customer notes
  - Wholesaler responses

#### Order Actions
- **Approve Orders**: Accept incoming orders with optional message
- **Reject Orders**: Decline orders with mandatory reason
- **WhatsApp Integration**: Direct contact via WhatsApp for quick communication
- **Response Messages**: Add delivery instructions, payment terms, or rejection reasons

### 4. Customer Management

#### Customer Information
- View all shop owners and businesses that purchase from you
- Customer details include:
  - Business name
  - Contact person
  - Email and phone
  - Total orders placed
  - Total amount spent
  - Last order date
  - Customer tier (Gold, Silver, Bronze)

#### Customer Features
- Search customers by name, contact, or email
- View customer statistics:
  - Total customer count
  - Gold tier customers
  - Total orders across all customers
  - Total revenue generated
- Track customer spending patterns
- No active/inactive status tracking (removed for simplification)

### 5. Invoices
- Generate and manage invoices for completed orders
- Track payment status
- View invoice history

### 6. Reports
- Sales analytics and reports
- Product performance tracking
- Customer insights
- Revenue reports

---

## Key Workflows

### Adding a Mobile Product
1. Click "Add Product" button
2. Select "Mobile" tab
3. Choose brand from searchable dropdown
4. Type to search and select the mobile model
5. Enter SKU, purchase price, and selling price
6. Set stock quantity and minimum stock level
7. Add optional description
8. Save product

### Adding an Accessory Product
1. Click "Add Product" button
2. Select "Accessory" tab
3. Choose brand from searchable dropdown
4. Manually enter the product name
5. Enter SKU, purchase price, and selling price
6. Set stock quantity and minimum stock level
7. Add optional description
8. Save product

### Processing an Order
1. Navigate to "Orders" page
2. View pending orders (shop orders or sales person orders)
3. Review order details, items, and customer notes
4. Choose to:
   - **Approve**: Add delivery/payment instructions and confirm
   - **Reject**: Provide reason and decline
   - **Contact**: Use WhatsApp integration to communicate directly
5. Order status updates automatically

### Managing Customer Relationships
1. Navigate to "Customers" page
2. Search for specific customers
3. View customer purchase history
4. Track customer tier and total spending
5. Use insights to provide better service to high-value customers

---

## Benefits

### For Wholesalers
- **Simplified Product Management**: Easy-to-use interface for adding mobiles and accessories
- **Automated Brand/Model Selection**: Pre-populated data reduces data entry errors
- **Unified Order Management**: All orders in one place regardless of source
- **Direct Communication**: WhatsApp integration for quick customer contact
- **Inventory Tracking**: Automatic low stock alerts prevent stockouts
- **Customer Insights**: Track best customers and spending patterns

### For Shop Owners & Sales Persons
- **Visibility**: Can browse all available products from wholesalers
- **Easy Ordering**: Place orders directly through the platform
- **Order Tracking**: See order status in real-time
- **Direct Communication**: Contact wholesalers via WhatsApp

---

## Technical Notes

### Backend Integration Points
The following data is expected to come from the backend:
1. **Brand List**: Array of brands for both mobiles and accessories
2. **Mobile Models**: Array of models filtered by brand ID
3. **Orders**: Both purchase orders and sales person orders
4. **Customers**: Shop owners and their purchase history

### Frontend Features
- **Searchable Dropdowns**: Brand selection with built-in search functionality
- **Autocomplete**: Model name suggestions as you type
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Filtering**: Instant product and order filtering
- **Stock Alerts**: Visual indicators for low stock items

---

## Navigation

### Main Menu Items
1. **Dashboard** - Overview and metrics
2. **Products** - Manage product listings
3. **Orders** - View and process all orders
4. **Customers** - Manage customer relationships
5. **Invoices** - Invoice management
6. **Reports** - Analytics and insights

---

## Future Enhancements (Not Currently Implemented)
- Bulk product import via CSV
- Multi-currency support
- Advanced reporting with date ranges
- Product image uploads
- Customer purchase recommendations
- Automated reorder suggestions based on sales trends
- SMS notifications in addition to WhatsApp
- Integration with shipping providers
- Multi-warehouse inventory management

---

*Last Updated: November 2025*
