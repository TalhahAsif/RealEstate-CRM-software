# Real Estate CRM

A CRM for real estate businesses to manage leads, customers, properties, projects,
site visits, deals, payments, and commissions.

This repository currently contains the **project foundation**: data models, database
connection, validation schemas, a placeholder UI for every module, and a scaffolded
API. Module-by-module business logic (CRUD, auth, reporting) is built incrementally
on top of this base.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [MongoDB](https://www.mongodb.com) + [Mongoose](https://mongoosejs.com)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Lucide React](https://lucide.dev) icons
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- ESLint

## Folder Structure

```text
src/
├── app/
│   ├── (auth)/            # Auth route group (login placeholder, no auth wired up)
│   ├── (main)/             # App shell (sidebar + header) shared by every module
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── customers/
│   │   ├── follow-ups/
│   │   ├── site-visits/
│   │   ├── properties/
│   │   ├── projects/
│   │   ├── deals/
│   │   ├── payments/
│   │   ├── commissions/
│   │   ├── documents/
│   │   ├── users/
│   │   ├── reports/
│   │   └── settings/
│   └── api/                # Route handlers, one folder per resource
│
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/              # Sidebar, Header, Breadcrumbs, DashboardLayout
│   ├── dashboard/            # Dashboard-specific widgets
│   └── shared/               # PageHeader, StatCard, DataTable, EmptyState, ...
│
├── lib/
│   ├── db/                  # mongodb.ts connection helper
│   ├── api/                  # Shared API response helpers
│   ├── utils/                 # cn() + formatting helpers
│   └── validations/            # Zod schemas
│
├── models/                  # Mongoose models
├── types/                   # Shared TypeScript types
└── constants/                # Enum-like constants shared by models, validation, UI
```

Routes for `dashboard`, `leads`, `properties`, etc. live inside the `(main)` route
group so they all share the sidebar/header layout, but the group doesn't affect the
URL — `/leads` is still `/leads`.

## Environment Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Set `MONGODB_URI` to your MongoDB connection string.

## MongoDB Setup

Any MongoDB instance works — a local `mongod`, Docker container, or a hosted cluster
(e.g. MongoDB Atlas). Example values for `.env.local`:

```env
# Local
MONGODB_URI=mongodb://127.0.0.1:27017/real-estate-crm

# Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/real-estate-crm
```

The connection helper at `src/lib/db/mongodb.ts` caches the connection across hot
reloads in development and across invocations in serverless environments.

## Running the Dev Server

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000) and redirects to `/dashboard`.

## Seeding Sample Data

With `MONGODB_URI` configured and reachable:

```bash
npm run seed
```

This clears and repopulates: 1 admin, 2 agents, 5 leads, 5 customers, 10 properties,
2 projects, 3 follow-ups, 2 site visits, and 2 deals — all fictional data.

## Currently Implemented

- Project scaffolding, TypeScript, Tailwind, shadcn/ui, ESLint
- Mongoose models for every core entity with indexes and ObjectId references
- MongoDB connection helper with hot-reload-safe caching
- Zod validation schemas for User, Lead, Customer, Property, and Project
- Dashboard shell: sidebar, header, breadcrumbs, and reusable page components
  (`PageHeader`, `StatCard`, `DataTable`, `EmptyState`)
- Placeholder pages for every module with empty-state tables
- Placeholder API routes (`GET` returns a "ready" response, `POST` returns `501`)
- Seed script with realistic fictional data

## Not Yet Implemented (by design)

- Authentication / authorization (the `(auth)/login` route is a static placeholder)
- CRUD functionality on any module (create/edit/delete forms, real API logic)
- File uploads (documents currently store a `url` field only)
- WhatsApp, email, payment gateway, or other external integrations
- Real-time updates
- Reporting/analytics queries (the Reports page is a static placeholder)

These are intentionally deferred — each module's requirements will be scoped and
implemented one at a time.

## Planned Future Modules

- Leads: capture, qualification, assignment, conversion to Customer
- Customers: full profile, linked deals and follow-ups
- Properties & Projects: listings management, media, availability
- Follow-ups & Site Visits: scheduling and reminders
- Deals, Payments & Commissions: pipeline tracking and payout calculations
- Documents: uploads and attachment to any entity
- Users: role-based access control
- Reports: sales, conversion, and agent performance dashboards
- Settings: company profile, roles, notifications
