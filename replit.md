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
- **POS System**: Quick products feature with `localStorage` persistence, management dialog for selecting frequently used products, quick product display section, dynamic header title, sidebar navigation toggle, two-column layout for quick products and cart, customer selection integrated into order summary, enhanced quick product search.
- **Super Admin Platform Management**: Notification system (with Zustand store), CRUD for pricing plans, admin user management (including shop assignment), shop management (subscription status, plan assignment), platform-wide user management (impersonation, role filtering), feature flags system (toggle features, shop-specific enablement), activity logs (audit trail, filtering).
- **Internationalization**: Support for `Accept-Language` header for multi-language responses (English, Urdu).

### System Design Choices
- **API Architecture**: Organized into `config`, `controllers`, `middleware`, `routes`, `validators`, `sql`, `scripts`, `utils` directories.
- **Role-Based Access Control**: Implemented using JWT middleware to secure API endpoints based on user roles.
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