# Overview

This is an Airtable integration web application built with React/TypeScript frontend and Express.js backend. The app provides a user interface for configuring Airtable API credentials and managing records within Airtable bases. It features a modern UI built with shadcn/ui components and Tailwind CSS, offering functionality to view, create, update, and delete Airtable records through a clean dashboard interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Styling**: Tailwind CSS with CSS variables for theming support

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints for Airtable operations
- **Data Storage**: In-memory storage for Airtable configuration (MemStorage class)
- **External Integration**: Direct Airtable API integration using fetch requests
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reloading with Vite middleware integration

## Database Design
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless driver for PostgreSQL connections
- **Configuration**: Environment-based database URL configuration

## Authentication & Authorization
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Architecture**: Prepared for session-based authentication but not fully implemented
- **Security**: CORS and credential handling configured for cross-origin requests

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (@neondatabase/serverless) with PostgreSQL
- **ORM**: Drizzle ORM with Zod integration for type-safe database operations
- **Validation**: Zod for runtime type checking and schema validation
- **HTTP Client**: Built-in fetch API for Airtable API communication

### UI/UX Dependencies
- **Component Library**: Extensive Radix UI primitives ecosystem
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Icons**: Lucide React icon library
- **Utilities**: Class Variance Authority (CVA) for component variants, clsx/tailwind-merge for class management

### Development Dependencies
- **Build Tool**: Vite with React plugin and TypeScript support
- **Runtime**: tsx for TypeScript execution in development
- **Bundler**: esbuild for production server bundling
- **Platform Integration**: Replit-specific plugins for cartographer and error overlay

### Third-Party Integrations
- **Airtable API**: Direct REST API integration for CRUD operations on Airtable bases
- **File Uploads**: Prepared infrastructure for attachment handling (currently mock implementation)
- **Date Handling**: date-fns library for date formatting and manipulation

The application follows a monorepo structure with shared TypeScript schemas between client and server, enabling type safety across the full stack. The architecture supports both development and production deployments with separate build processes and environment configurations.