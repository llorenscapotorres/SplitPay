# SplitBill - Group Payment System

## Overview

SplitBill is a web-based platform designed to facilitate group payments in restaurant settings. The system enables diners to scan QR codes at their table, view their bill in real-time, select individual items to pay for, and process secure payments. Restaurant staff can monitor payment status across all tables through a comprehensive dashboard.

The application follows a full-stack architecture with a React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and integrates payment processing capabilities. The core functionality revolves around QR code-to-bill mapping, real-time bill synchronization, individual item selection with fractional payments, and instant payment status updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state and local React state for UI
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with consistent error handling
- **Real-time Updates**: Polling-based updates every 30 seconds for bill synchronization
- **Data Validation**: Zod schemas for request/response validation
- **Storage Interface**: Abstract storage layer with in-memory implementation for development

### Database Design
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: Four main entities:
  - Tables: Restaurant table information with QR codes
  - Bills: Order totals, payment status, and table associations
  - Bill Items: Individual menu items with quantities and payment tracking
  - Payments: Transaction records with item-level payment details
- **Relationships**: Foreign key constraints ensuring data integrity
- **Payment Tracking**: Detailed tracking of paid vs unpaid quantities per item

### Authentication & Security
- **Payment Processing**: Designed for integration with secure payment providers (Stripe/PayPal)
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Input Validation**: Server-side validation using Drizzle-Zod schemas
- **CORS & Security**: Standard Express security middleware

### Key Design Patterns
- **Repository Pattern**: Abstract storage interface allows for different implementations
- **Component Composition**: Reusable UI components with clear separation of concerns
- **Error Boundaries**: Comprehensive error handling at both API and component levels
- **Real-time Data**: Polling strategy for live bill updates without WebSocket complexity

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM with schema migrations
- **express**: Web application framework for the backend API
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional CSS class utilities

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across frontend and backend
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **react-hook-form**: Form state management with validation
- **zod**: Schema validation for TypeScript
- **nanoid**: Unique ID generation

### Payment Integration (Planned)
- **Stripe or PayPal SDK**: Secure payment processing
- **@types/qrcode**: QR code generation for table identification

The architecture prioritizes simplicity, type safety, and real-time data synchronization while maintaining clear separation between frontend presentation, backend business logic, and data persistence layers.