# Multi-Role SaaS POS System

## Overview
This project is a premium multi-role Point of Sale (POS) system specifically designed for mobile repair shops. It features three distinct user dashboards: Super Admin, Admin/Shop Owner, and Sales Person, aiming to streamline operations, enhance management capabilities, and improve sales processes within the mobile repair industry. The system offers comprehensive functionalities including product management, sales tracking, repair job management, user and shop administration, and detailed analytics. Its business vision is to provide a robust, scalable, and intuitive platform that empowers shop owners and super administrators to efficiently manage their operations, optimize inventory, and boost profitability.

## User Preferences
I prefer clear and concise explanations. I value iterative development and expect the agent to communicate proposed changes before implementation, especially for significant modifications. I appreciate detailed summaries of work completed. Do not make changes to the `replit.nix` file.

## System Architecture

### UI/UX Decisions
The application features a modern, luxurious, and premium design inspired by high-end fintech apps and SaaS dashboards.

- **Color Palette**: Deep Indigo (primary), Royal Purple (accent), Slate (secondary), with Teal-Green (success), Amber (warning), and Controlled Red (error).
- **Visual Features**: Dark sidebar with gradient backgrounds and bright hover states, premium stat cards with gradient headers, modern charts with gradient fills, glass-morphism effects on headers, sophisticated shadows, animated login page with blob animations, and rounded borders (xl/2xl).
- **Component Design**: Dark themed sidebar with purple accents, sticky glass-morphism header, gradient stat cards, gradient-filled line charts, tables with hover states and status indicators, and an animated login page.

### Technical Implementations
- **Frontend**: React, TypeScript, Wouter (routing), TailwindCSS, Shadcn UI, Radix UI for UI components, Zustand for state management, TanStack Query for data fetching, Recharts for charts.
- **Backend**: Express.js, Node.js, TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: JWT (JSON Web Tokens) for secure, role-based access.

### Feature Specifications
- **Super Admin**: System-wide analytics dashboard, shop admin management, pricing plan configuration, system analytics.
- **Admin (Shop Owner)**: Shop performance dashboard, product & category management, sales reports, staff management, subscription management, POS access.
- **Sales Person**: POS interface, recent sales view, product catalog access.
- **Dashboard Features**: Stat cards (Today's Sales, Wallet Balance, Total Stock, Clients Credit), multi-period sales analytics chart, devices in repair tracking, recent sales, low stock alerts.
- **User Management Features**:
  - **Sales Person Management**: Admins can add, edit, and deactivate sales persons with package-based limits (Silver: 3, Gold: 10, Platinum: 50 staff).
  - **Password Reset Workflow**: Sales persons can request password resets through the login page, which creates an admin notification. Admins can approve/reject password reset requests from the Staff management page.
  - **Profile Management**: All authenticated users can view and update their profile (username, email, phone, address, etc.) via the /profile route. Password change is available for admins/super admins directly; sales persons must request reset through admin.
- **POS System**: Quick products feature with `localStorage` persistence, management dialog for selecting frequently used products, quick product display section, dynamic header title, sidebar navigation toggle, two-column layout for quick products and cart, customer selection integrated into order summary, enhanced quick product search.
- **Super Admin Platform Management**: Notification system (with Zustand store), CRUD for pricing plans, admin user management (including shop assignment), shop management (subscription status, plan assignment), platform-wide user management (impersonation, role filtering), feature flags system (toggle features, shop-specific enablement), activity logs (audit trail, filtering).
- **Internationalization**: Full multi-language support (English, Urdu) with:
  - Frontend i18next integration for UI translations
  - Backend localization using Accept-Language header detection
  - Translation files: `backend/locales/en.json` and `backend/locales/ur.json`
  - Language middleware (`backend/middleware/language.js`) for request language detection
  - Translation helper (`backend/utils/i18n.js`) with parameter interpolation and fallback mechanism
  - All API responses return localized error/success messages based on user's language preference

### System Design Choices
- **API Architecture**: Organized into `config`, `controllers`, `middleware`, `routes`, `validators`, `sql`, `scripts`, `utils` directories.
- **Role-Based Access Control (RBAC)**: Centralized AccessControl system in `src/config/accessControl.ts`:
  - **AccessControl Configuration**: Single source of truth for all page and component permissions
  - **Page Keys**: Each route has a unique PageKey (e.g., `adminDashboard`, `posProducts`, `wholesalerOrders`)
  - **useAuth Hook**: Takes a PageKey and validates access against AccessControl.pages
  - **useCanAccess Hook**: For component-level permission checks
  - **Adding New Routes**: 1) Define PageKey in AccessControl.pages, 2) Use useAuth("pageKey") in the page component
- **Modular Frontend**: Components are organized into `components/`, `pages/`, `store/`, and `utils/` for maintainability.
- **Responsive Design**: Prioritizes adaptability across various screen sizes and devices.

## External Dependencies
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JSON Web Tokens (JWT)
- **UI Libraries**: Shadcn UI, Radix UI
- **Charting**: Recharts
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: Wouter