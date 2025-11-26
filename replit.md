# Multi-Role SaaS POS System

## Project Overview
A premium multi-role Point of Sale system designed for mobile repair shops with three distinct user dashboards (Super Admin, Admin/Shop Owner, and Sales Person).

## Technology Stack
- **Frontend**: React, TypeScript, Wouter (routing), TailwindCSS
- **Backend**: Express.js, Node.js
- **UI Components**: Shadcn UI, Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Charts**: Recharts
- **Storage**: In-memory storage (MemStorage)

## Design System

### Current Design (v2.0 - Premium Modern)
The application features a **modern, luxurious, and premium design** inspired by high-end fintech apps and SaaS dashboards.

#### Color Palette
- **Primary**: Deep Indigo (233 47% 25%) - Sophisticated depth
- **Accent**: Royal Purple (265 85% 65%) - Premium luxury
- **Secondary**: Slate (215 25% 27%) - Professional anchor
- **Success**: Teal-Green (158 64% 52%)
- **Warning**: Amber (38 95% 62%)
- **Error**: Controlled Red (0 72% 51%)

#### Visual Features
- **Dark sidebar** with gradient backgrounds and bright hover states
- **Premium stat cards** with gradient headers and decorative circles
- **Modern charts** with gradient fills and smooth animations
- **Glass-morphism effects** on header (backdrop blur)
- **Sophisticated shadows** - subtle elevation throughout
- **Animated login page** with blob animations
- **Rounded borders** (xl/2xl) for premium feel
- **Color-coded role indicators** with gradients

### Component Design
1. **Sidebar**: Dark theme (deep indigo) with purple accent hover states, rounded navigation items
2. **Header**: Glass-morphism effect with backdrop blur, sticky positioning
3. **Stat Cards**: Gradient backgrounds with decorative circles, trend indicators
4. **Charts**: Gradient-filled line charts with smooth curves
5. **Tables**: Hover states, striped rows, status indicators with dots
6. **Login Page**: Animated gradient blobs, premium card with shadow

## User Roles & Authentication

### Demo Accounts
- **Super Admin**: `superadmin / admin123`
- **Admin**: `admin / admin123`
- **Sales Person**: `sales / sales123`

### Role-Based Features

#### Super Admin
- Dashboard with system-wide analytics
- Manage all shop admins
- Configure pricing plans
- View system analytics

#### Admin (Shop Owner)
- Shop performance dashboard
- Product & category management
- Sales reports & analytics
- Staff management
- Subscription management
- POS access

#### Sales Person
- POS interface
- Recent sales view
- Product catalog access

## Dashboard Features

### Admin Dashboard Includes:
1. **Stat Cards** (4):
   - Today's Sales (Teal gradient)
   - Wallet Balance (Blue-Indigo gradient)
   - Total Stock Available (Purple-Pink gradient)
   - Clients Credit (Amber-Orange gradient)

2. **Sales Analytics Chart**:
   - Multi-period views (Weekly, Monthly, Yearly, Custom)
   - Dual-line chart (Sales & Profit)
   - Gradient fills and smooth curves

3. **Devices in Repair**:
   - Active repair queue table
   - Status indicators with colored dots
   - Estimated completion dates

4. **Recent Sales**:
   - Last 5 transactions
   - Customer details
   - Item breakdown
   - View All button

5. **Low Stock Alert**:
   - Products below minimum threshold
   - Out of stock indicators
   - Category breakdown

## Project Structure

```
client/src/
├── components/
│   ├── ui/ (Shadcn components)
│   ├── AppSidebar.tsx
│   ├── AppHeader.tsx
│   ├── StatCard.tsx
│   ├── SalesAnalyticsChart.tsx
│   ├── DataTable.tsx
│   ├── DevicesInRepair.tsx
│   ├── LastSales.tsx
│   └── LowStockAlert.tsx
├── pages/
│   ├── auth/Login.tsx
│   ├── admin/ (Admin dashboard & pages)
│   ├── superadmin/ (Super admin pages)
│   └── pos/ (POS interface)
├── store/authStore.ts
├── utils/mockData.ts
└── index.css

server/
├── index.ts
├── routes.ts
└── storage.ts

shared/
└── schema.ts
```

## Recent Changes (Latest Session)

### Backend Integration for Authentication (November 26, 2025 - Latest)
Complete implementation of language-aware API client and authentication system:

#### Language-Aware API Client
1. **Accept-Language Header**
   - All API requests now include `Accept-Language` header based on i18next language
   - Backend can return responses in the correct language (English, Urdu)
   - Works with apiRequest, apiRequestRaw, and TanStack Query's default queryFn

#### Authentication Hooks (`src/hooks/useAuth.ts`)
1. **useLogin** - TanStack Query mutation for login
2. **useSignup** - TanStack Query mutation for registration  
3. **useLogout** - TanStack Query mutation for logout
4. **useAuth** - Role-based route protection (consolidated from previous file)
   - All mutations use onSettled for proper loading state cleanup

#### Login & Signup Pages
1. **Login Page** (`src/pages/auth/Login.tsx`)
   - TanStack Query mutations for API calls
   - Loading states with isPending
   - Error handling with toast notifications
   - Multi-language support (English/Urdu)

2. **Signup Page** (`src/pages/auth/Signup.tsx`)
   - Role selection (Shop Admin, Sales Person, Repair Technician, Wholesaler)
   - Conditional business name field for wholesalers/repair technicians
   - Password confirmation validation
   - Complete translations for English and Urdu

#### Auth Store Updates (`src/store/authStore.ts`)
- Added AuthResponse type for API responses
- Added User type export for type safety
- Added setIsLoading method for loading state management

### POS Layout Improvements (November 12, 2025)
Enhanced the POS page layout for better usability and screen real estate optimization:

#### Layout Changes
1. **Header Title Integration**
   - Added `useTitle` hook to set dynamic page title in header
   - Title now displays "Point of Sale" in the main application header
   - Removes redundant page title from POS page itself

2. **Sidebar Navigation**
   - Added SidebarTrigger button to POS page header
   - Users can now open sidebar while on POS page to navigate to other sections
   - Removed forced sidebar closing to enable proper toggle functionality

3. **Two-Column Layout for Quick Products and Cart**
   - Reorganized Quick Products and Current Sale into side-by-side columns
   - Better utilization of horizontal screen space
   - Responsive grid: stacks vertically on smaller screens, shows columns on md+ viewports
   - Both sections maintain scrollable areas for long lists

4. **Customer Selection in Order Summary**
   - Moved customer selection from separate card to Order Summary section
   - Reduces vertical scrolling needed
   - Consolidates checkout-related controls in one place
   - "Add New Customer" button remains accessible

5. **Quick Products Search Enhancement**
   - Added search input in QuickProductsDialog for filtering products
   - Real-time search filtering by product name (case-insensitive)
   - Shows result count badge when searching
   - Empty state when no products match search query
   - Search resets when dialog closes

#### UI & Responsive Fixes
1. **Text Overflow Fixes**
   - Quick Products: Added `min-w-0`, `w-full`, and `break-words` to prevent text overflow
   - Cart Items: Added `min-w-0` and `break-words` with proper flex wrapping
   - Product names now properly clamp to 2 lines and wrap within buttons

2. **Mobile Responsiveness**
   - Responsive font sizes (text-sm/base) for better mobile readability
   - Adaptive spacing (gap-2/gap-3, p-2/p-3) for different screen sizes
   - Smaller icon buttons (h-8 w-8) and controls for mobile
   - Narrower quantity inputs (w-12/w-16) that fit on mobile screens
   - Flexible cart layout that maintains functionality on narrow screens

#### Technical Implementation
- Modified `src/pages/pos/POS.tsx` with new layout structure
- Enhanced `src/components/QuickProductsDialog.tsx` with search functionality
- Updated `src/components/CartItem.tsx` with responsive classes and text overflow fixes
- Maintained all existing functionality (cart, payments, order holding, etc.)
- Preserved responsive design and accessibility features
- All data-testid attributes updated for new layout

### POS Quick Products Feature (November 12, 2025)
Implemented a quick products feature for faster checkout:

#### Features Added
1. **Quick Products Hook** (`useQuickProducts`)
   - localStorage persistence for selected quick products
   - Maximum 12 products limit with enforcement
   - Survives page refresh and app restarts

2. **Quick Products Management Dialog**
   - Select/deselect frequently used products
   - Visual feedback with checkbox UI
   - Live counter showing selection progress (X/12)
   - Limit enforcement prevents selection bypass via keyboard
   - Disabled state when maximum reached

3. **Quick Products Display Section**
   - Positioned below Product Search on POS page
   - Responsive grid layout (2/3/4 columns based on screen size)
   - Product buttons show name, price, and low stock badges
   - Single-click to add product to cart
   - Empty state with helpful guidance when no products selected
   - Settings button in header to manage selections

#### Technical Implementation
- Created `src/hooks/useQuickProducts.ts` for state management
- Created `src/components/QuickProductsDialog.tsx` for management UI
- Integrated into `src/pages/pos/POS.tsx` with proper positioning
- All accessibility features and data-testid attributes added
- Fixed DOM nesting and checkbox bypass issues

### Super Admin Platform Management (November 2025)
Complete implementation of super admin capabilities for platform-wide management:

#### New Features Implemented
1. **Notification System**
   - Added notifications table to database schema
   - Created notification store with Zustand for state management
   - Implemented interactive notification panel in header with bell icon
   - Supports unread count, mark as read, and delete notifications
   - Type-based notification icons and colors (success, warning, error, info)

2. **Pricing Plan Management** (`/super-admin/pricing`)
   - Full CRUD operations for subscription plans (Create, Read, Update, Delete)
   - Toggle active/inactive status for plans
   - Configure max staff, max products, and feature lists per plan
   - Visual pricing cards with feature comparison

3. **Admin User Management** (`/super-admin/admins`)
   - Create new admin accounts with role assignment
   - Password validation and security requirements
   - Shop assignment for admin users
   - View all admins with status and activity tracking

4. **Shop Management** (`/super-admin/shops`)
   - View all shops with subscription status
   - Assign/update subscription plans for shops
   - Monitor shop activity and admin assignments
   - Filter and search shops

5. **User Management** (`/super-admin/users`)
   - View all users across the platform
   - User impersonation capability for support
   - Filter users by role (admin, sales, repair, wholesaler)
   - User status management (active/suspended)

6. **Feature Flags System** (`/super-admin/feature-flags`)
   - Toggle features on/off across the platform
   - Shop-specific feature enablement
   - Gradual rollout capabilities
   - Feature descriptions and status tracking

7. **Activity Logs** (`/super-admin/activity-logs`)
   - System-wide audit trail
   - Filter by action type (CREATE, UPDATE, DELETE, LOGIN)
   - IP address and user agent tracking
   - Search functionality across all logs

#### Technical Implementation
- All features use inline demo data in component state (no backend yet)
- Proper TypeScript types from shared schema
- Consistent use of Shadcn UI components
- All features follow the premium design system
- Ready for backend integration - just connect the API endpoints

#### Schema Extensions
- Added `notifications` table for notification system
- Added `activityLogs` table for audit trail
- Added `featureFlags` table for feature management
- Updated `pricingPlans` table with new fields

### Complete Design Overhaul
- Updated entire color scheme to premium indigo/purple palette
- Redesigned sidebar with dark theme and bright hover states
- Added glass-morphism header with backdrop blur
- Enhanced stat cards with gradients and decorative elements
- Improved charts with gradient fills
- Added animated login page with blob animations
- Updated all tables with better hover states and status indicators
- Consistent rounded corners (xl/2xl) throughout
- Premium shadows and elevation effects

### Technical Improvements
- Optimized component structure
- Added hover-elevate and active-elevate-2 utility classes
- Implemented proper color theming with CSS variables
- Enhanced responsive design
- Improved accessibility with better contrast ratios

## Development Notes

### Mock Data
Currently using mock data for prototype with `//todo: remove mock functionality` comments. These should be replaced with actual API calls when backend is ready.

### Future Enhancements
- Connect to real backend API
- Implement real-time updates with WebSockets
- Add more detailed analytics
- Implement receipt printing
- Add barcode scanning functionality
- Multi-language support (currently has UI for 5 languages)
- Dark mode toggle (infrastructure ready)

## Running the Application
```bash
npm run dev
```
Server runs on port 5000 with both frontend and backend on same port.

## Design Guidelines
See `design_guidelines.md` for comprehensive design system documentation.
