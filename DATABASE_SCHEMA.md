# POS System Database Schema

This document describes the database tables required for the POS (Point of Sale) System application to function properly.

---

## Table of Contents

1. [Enums](#enums)
2. [Core Tables](#core-tables)
   - [users](#users)
   - [shops](#shops)
   - [products](#products)
   - [categories](#categories)
   - [customers](#customers)
3. [Sales Tables](#sales-tables)
   - [sales](#sales)
   - [sale_items](#sale_items)
4. [Subscription & Configuration Tables](#subscription--configuration-tables)
   - [pricing_plans](#pricing_plans)
   - [feature_flags](#feature_flags)
5. [Notification & Audit Tables](#notification--audit-tables)
   - [notifications](#notifications)
   - [activity_logs](#activity_logs)
6. [Wholesaler Tables](#wholesaler-tables)
   - [wholesaler_products](#wholesaler_products)
   - [purchase_orders](#purchase_orders)
   - [purchase_order_items](#purchase_order_items)
   - [deal_requests](#deal_requests)
7. [Repair Management Tables](#repair-management-tables)
   - [repair_persons](#repair_persons)
   - [repair_jobs](#repair_jobs)
   - [repair_payments](#repair_payments)
8. [Entity Relationships](#entity-relationships)

---

## Enums

### purchase_order_status
| Value | Description |
|-------|-------------|
| `pending` | Order is awaiting review |
| `approved` | Order has been approved by wholesaler |
| `rejected` | Order has been rejected |
| `fulfilled` | Order has been completed and delivered |

### deal_request_status
| Value | Description |
|-------|-------------|
| `pending` | Deal request is awaiting review |
| `approved` | Deal has been approved |
| `rejected` | Deal has been rejected |
| `negotiating` | Deal is under negotiation |

### repair_priority
| Value | Description |
|-------|-------------|
| `normal` | Standard priority repair |
| `urgent` | High priority repair requiring immediate attention |

### repair_status
| Value | Description |
|-------|-------------|
| `pending` | Repair job is waiting to be assigned |
| `assigned` | Job has been assigned to a repair person |
| `in_progress` | Repair work is currently underway |
| `waiting_parts` | Repair is paused waiting for parts |
| `completed` | Repair work has been completed |
| `delivered` | Device has been returned to customer |
| `cancelled` | Repair job was cancelled |

---

## Core Tables

### users

Stores all user accounts including super admins, shop admins, sales persons, repair technicians, and wholesalers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `username` | TEXT | NOT NULL, UNIQUE | Login username |
| `password` | TEXT | NOT NULL | Hashed password |
| `email` | TEXT | NOT NULL, UNIQUE | User email address |
| `role` | TEXT | NOT NULL | User role: `super_admin`, `admin`, `sales_person`, `repair_man`, `wholesaler` |
| `shop_id` | VARCHAR | NULLABLE | Reference to associated shop (for non-super-admin users) |
| `business_name` | TEXT | NULLABLE | Business name (for wholesalers) |
| `phone` | TEXT | NULLABLE | Contact phone number |
| `whatsapp` | TEXT | NULLABLE | WhatsApp number |
| `address` | TEXT | NULLABLE | Physical address |
| `created_at` | TIMESTAMP | DEFAULT now() | Account creation timestamp |

---

### shops

Stores shop information for retail locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `name` | TEXT | NOT NULL | Shop name |
| `owner_id` | VARCHAR | NOT NULL | Reference to shop owner (user) |
| `subscription_tier` | TEXT | NOT NULL, DEFAULT 'silver' | Subscription level: `silver`, `gold`, `platinum` |
| `subscription_status` | TEXT | NOT NULL, DEFAULT 'active' | Status: `active`, `inactive`, `suspended` |
| `phone` | TEXT | NULLABLE | Shop phone number |
| `whatsapp` | TEXT | NULLABLE | Shop WhatsApp number |
| `address` | TEXT | NULLABLE | Shop physical address |
| `created_at` | TIMESTAMP | DEFAULT now() | Shop registration timestamp |

---

### products

Stores product inventory for each shop.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to owning shop |
| `name` | TEXT | NOT NULL | Product name |
| `barcode` | TEXT | NULLABLE | Product barcode/SKU |
| `category_id` | VARCHAR | NULLABLE | Reference to product category |
| `price` | DECIMAL(10,2) | NOT NULL | Selling price |
| `stock` | INTEGER | NOT NULL, DEFAULT 0 | Current stock quantity |
| `low_stock_threshold` | INTEGER | NOT NULL, DEFAULT 5 | Alert threshold for low stock |
| `created_at` | TIMESTAMP | DEFAULT now() | Product creation timestamp |

---

### categories

Stores hierarchical product categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to owning shop |
| `name` | TEXT | NOT NULL | Category name |
| `type` | TEXT | NOT NULL | Category type: `mobile`, `accessory`, etc. |
| `parent_id` | VARCHAR | NULLABLE | Reference to parent category (for subcategories) |
| `level` | INTEGER | NOT NULL, DEFAULT 1 | Hierarchy level (1 = root) |
| `created_at` | TIMESTAMP | DEFAULT now() | Category creation timestamp |

---

### customers

Stores customer information for each shop.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to associated shop |
| `name` | TEXT | NOT NULL | Customer full name |
| `email` | TEXT | NULLABLE | Customer email |
| `phone` | TEXT | NULLABLE | Customer phone number |
| `address` | TEXT | NULLABLE | Customer address |
| `total_purchases` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Total purchase amount (for loyalty tracking) |
| `created_at` | TIMESTAMP | DEFAULT now() | Customer creation timestamp |

---

## Sales Tables

### sales

Stores sales transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to shop where sale occurred |
| `sales_person_id` | VARCHAR | NOT NULL | Reference to user who made the sale |
| `customer_id` | VARCHAR | NULLABLE | Reference to customer (if registered) |
| `payment_method` | TEXT | NOT NULL, DEFAULT 'cash' | Payment method: `cash`, `card`, `mobile`, etc. |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Sum before tax and discounts |
| `tax` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Tax amount |
| `discount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Discount applied |
| `total` | DECIMAL(10,2) | NOT NULL | Final sale amount |
| `created_at` | TIMESTAMP | DEFAULT now() | Sale timestamp |

---

### sale_items

Stores individual items within each sale transaction.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `sale_id` | VARCHAR | NOT NULL | Reference to parent sale |
| `product_id` | VARCHAR | NOT NULL | Reference to product sold |
| `quantity` | INTEGER | NOT NULL | Quantity sold |
| `price` | DECIMAL(10,2) | NOT NULL | Unit price at time of sale |
| `total` | DECIMAL(10,2) | NOT NULL | Line item total (quantity x price) |

---

## Subscription & Configuration Tables

### pricing_plans

Stores subscription plans for shops.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `name` | TEXT | NOT NULL | Plan name (e.g., Silver, Gold, Platinum) |
| `price` | DECIMAL(10,2) | NOT NULL | Monthly subscription price |
| `max_staff` | INTEGER | NOT NULL | Maximum number of staff accounts |
| `max_products` | INTEGER | NOT NULL | Maximum number of products |
| `features` | TEXT[] | NULLABLE | Array of included feature names |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether plan is currently offered |
| `created_at` | TIMESTAMP | DEFAULT now() | Plan creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

---

### feature_flags

Stores feature toggles for enabling/disabling functionality.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `name` | TEXT | NOT NULL, UNIQUE | Feature flag name |
| `description` | TEXT | NULLABLE | Feature description |
| `is_enabled` | BOOLEAN | NOT NULL, DEFAULT false | Whether feature is enabled |
| `shop_id` | VARCHAR | NULLABLE | Shop-specific flag (null = global) |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

---

## Notification & Audit Tables

### notifications

Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `user_id` | VARCHAR | NOT NULL | Reference to recipient user |
| `title` | TEXT | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification body |
| `type` | TEXT | NOT NULL | Notification type: `info`, `warning`, `error`, `success` |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT false | Read status |
| `action_url` | TEXT | NULLABLE | Link for notification action |
| `created_at` | TIMESTAMP | DEFAULT now() | Notification timestamp |

---

### activity_logs

Stores audit trail of user actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `user_id` | VARCHAR | NOT NULL | Reference to user who performed action |
| `action` | TEXT | NOT NULL | Action performed (e.g., `create`, `update`, `delete`) |
| `entity_type` | TEXT | NOT NULL | Type of entity affected (e.g., `product`, `sale`) |
| `entity_id` | VARCHAR | NULLABLE | ID of affected entity |
| `details` | TEXT | NULLABLE | Additional action details (JSON) |
| `ip_address` | TEXT | NULLABLE | User's IP address |
| `user_agent` | TEXT | NULLABLE | User's browser/client info |
| `created_at` | TIMESTAMP | DEFAULT now() | Action timestamp |

---

## Wholesaler Tables

### wholesaler_products

Stores products offered by wholesalers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `wholesaler_id` | VARCHAR | NOT NULL | Reference to wholesaler user |
| `name` | TEXT | NOT NULL | Product name |
| `description` | TEXT | NULLABLE | Product description |
| `category` | TEXT | NOT NULL | Category: `mobile`, `accessory` |
| `price` | DECIMAL(10,2) | NOT NULL | Wholesale price |
| `stock` | INTEGER | NOT NULL, DEFAULT 0 | Available quantity |
| `discount` | DECIMAL(5,2) | DEFAULT 0 | Discount percentage |
| `min_order_quantity` | INTEGER | NOT NULL, DEFAULT 1 | Minimum order quantity |
| `unit` | TEXT | NOT NULL, DEFAULT 'pack' | Unit of measure |
| `image_url` | TEXT | NULLABLE | Product image URL |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether product is available |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

---

### purchase_orders

Stores orders from shops to wholesalers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `order_number` | TEXT | NOT NULL, UNIQUE | Human-readable order number |
| `shop_id` | VARCHAR | NOT NULL | Reference to ordering shop |
| `wholesaler_id` | VARCHAR | NOT NULL | Reference to wholesaler |
| `shop_name` | TEXT | NOT NULL | Shop name (denormalized) |
| `shop_address` | TEXT | NULLABLE | Shop address |
| `shop_phone` | TEXT | NULLABLE | Shop phone |
| `shop_email` | TEXT | NULLABLE | Shop email |
| `contact_person` | TEXT | NOT NULL | Order contact person |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Order status (see enum) |
| `subtotal` | DECIMAL(10,2) | NOT NULL | Order subtotal |
| `discount` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Discount amount |
| `total` | DECIMAL(10,2) | NOT NULL | Order total |
| `notes` | TEXT | NULLABLE | Order notes from shop |
| `wholesaler_response` | TEXT | NULLABLE | Response from wholesaler |
| `created_at` | TIMESTAMP | DEFAULT now() | Order creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

---

### purchase_order_items

Stores individual items within purchase orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `purchase_order_id` | VARCHAR | NOT NULL | Reference to parent order |
| `wholesaler_product_id` | VARCHAR | NOT NULL | Reference to wholesaler product |
| `product_name` | TEXT | NOT NULL | Product name (denormalized) |
| `quantity` | INTEGER | NOT NULL | Ordered quantity |
| `price` | DECIMAL(10,2) | NOT NULL | Unit price |
| `total` | DECIMAL(10,2) | NOT NULL | Line item total |

---

### deal_requests

Stores negotiation requests between shops and wholesalers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to requesting shop |
| `wholesaler_id` | VARCHAR | NOT NULL | Reference to target wholesaler |
| `shop_name` | TEXT | NOT NULL | Shop name |
| `shop_phone` | TEXT | NULLABLE | Shop phone |
| `shop_email` | TEXT | NULLABLE | Shop email |
| `wholesaler_product_id` | VARCHAR | NULLABLE | Reference to specific product |
| `product_name` | TEXT | NULLABLE | Product name |
| `requested_discount` | DECIMAL(5,2) | NULLABLE | Requested discount percentage |
| `requested_price` | DECIMAL(10,2) | NULLABLE | Requested price |
| `quantity` | INTEGER | NULLABLE | Requested quantity |
| `message` | TEXT | NOT NULL | Deal request message |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Request status (see enum) |
| `wholesaler_response` | TEXT | NULLABLE | Wholesaler's response |
| `created_at` | TIMESTAMP | DEFAULT now() | Request timestamp |
| `updated_at` | TIMESTAMP | DEFAULT now() | Last update timestamp |

---

## Repair Management Tables

### repair_persons

Stores repair technician information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to associated shop |
| `name` | TEXT | NOT NULL | Technician name |
| `phone` | TEXT | NULLABLE | Phone number |
| `email` | TEXT | NULLABLE | Email address |
| `is_available` | BOOLEAN | NOT NULL, DEFAULT true | Availability status |
| `created_at` | TIMESTAMP | DEFAULT now() | Creation timestamp |

---

### repair_jobs

Stores device repair jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `shop_id` | VARCHAR | NOT NULL | Reference to shop |
| `ticket_number` | TEXT | NOT NULL, UNIQUE | Human-readable ticket number |
| `customer_id` | VARCHAR | NULLABLE | Reference to registered customer |
| `customer_name` | TEXT | NOT NULL | Customer name |
| `customer_phone` | TEXT | NOT NULL | Customer phone |
| `customer_dni` | TEXT | NULLABLE | Customer ID number |
| `device_brand` | TEXT | NOT NULL | Device brand (e.g., Apple, Samsung) |
| `device_model` | TEXT | NOT NULL | Device model |
| `imei` | TEXT | NULLABLE | Device IMEI number |
| `defect_summary` | TEXT | NOT NULL | Brief defect description |
| `problem_description` | TEXT | NOT NULL | Detailed problem description |
| `priority` | ENUM | NOT NULL, DEFAULT 'normal' | Repair priority (see enum) |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Repair status (see enum) |
| `estimated_cost` | DECIMAL(10,2) | NULLABLE | Estimated repair cost |
| `advance_payment` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Advance payment received |
| `total_paid` | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Total amount paid |
| `repair_person_id` | VARCHAR | NULLABLE | Reference to assigned technician |
| `repair_person_name` | TEXT | NULLABLE | Technician name (denormalized) |
| `auto_assign` | BOOLEAN | NOT NULL, DEFAULT false | Auto-assignment flag |
| `photos` | TEXT[] | NULLABLE | Array of photo URLs |
| `due_date` | TIMESTAMP | NULLABLE | Expected completion date |
| `assigned_at` | TIMESTAMP | NULLABLE | Assignment timestamp |
| `completed_at` | TIMESTAMP | NULLABLE | Completion timestamp |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT now() | Job creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT now() | Last update timestamp |

---

### repair_payments

Stores payments for repair jobs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY, DEFAULT uuid | Unique identifier |
| `repair_job_id` | VARCHAR | NOT NULL | Reference to repair job |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount |
| `payment_method` | TEXT | NOT NULL, DEFAULT 'cash' | Payment method |
| `note` | TEXT | NULLABLE | Payment note |
| `created_at` | TIMESTAMP | DEFAULT now() | Payment timestamp |

---

## Entity Relationships

```
users
  |
  |--< shops (owner_id)
  |--< notifications (user_id)
  |--< activity_logs (user_id)
  |--< wholesaler_products (wholesaler_id)
  |--< sales (sales_person_id)

shops
  |
  |--< products (shop_id)
  |--< categories (shop_id)
  |--< customers (shop_id)
  |--< sales (shop_id)
  |--< feature_flags (shop_id)
  |--< purchase_orders (shop_id)
  |--< deal_requests (shop_id)
  |--< repair_persons (shop_id)
  |--< repair_jobs (shop_id)

products
  |
  |--< sale_items (product_id)
  |--- categories (category_id)

categories
  |
  |--- categories (parent_id) [self-referencing for hierarchy]

customers
  |
  |--< sales (customer_id)
  |--< repair_jobs (customer_id)

sales
  |
  |--< sale_items (sale_id)

wholesaler_products
  |
  |--< purchase_order_items (wholesaler_product_id)
  |--< deal_requests (wholesaler_product_id)

purchase_orders
  |
  |--< purchase_order_items (purchase_order_id)

repair_persons
  |
  |--< repair_jobs (repair_person_id)

repair_jobs
  |
  |--< repair_payments (repair_job_id)
```

---

## Summary

This POS System requires **18 database tables** organized into the following modules:

| Module | Tables | Purpose |
|--------|--------|---------|
| Core | 5 | Users, Shops, Products, Categories, Customers |
| Sales | 2 | Sales transactions and line items |
| Configuration | 2 | Pricing plans and feature flags |
| Notifications | 2 | User notifications and activity audit logs |
| Wholesaler | 4 | Wholesaler products, purchase orders, and deal requests |
| Repair | 3 | Repair technicians, jobs, and payments |

**Total: 18 Tables + 4 Enums**
