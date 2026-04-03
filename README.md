# TimeTracker

Employee time tracking & monitoring platform with client billing. Track hours, capture screenshots, monitor app usage, and generate invoices.

## Architecture

| Package | Stack | Description |
|---------|-------|-------------|
| `packages/api` | Node.js, Express, Prisma, PostgreSQL | REST API with JWT auth, role-based permissions |
| `packages/web` | Next.js 14, React, Tailwind, Recharts | Web dashboard for managers and admins |
| `packages/agent` | Electron, TypeScript | Desktop agent for screenshots & activity tracking |
| `packages/shared` | TypeScript, Zod | Shared types, schemas, permissions, utilities |

## Features

### Desktop Agent (Electron)
- Screenshot capture at configurable intervals (1/2/5/10 min or random)
- Keystroke & mouse activity tracking (counts only, no keylogging)
- Active app/URL detection with productivity categorization
- Idle detection with configurable timeout
- Offline mode — queues data locally (SQLite), syncs when back online
- Per-user monitoring settings (screenshot interval, blur, disable)

### Web Dashboard
- **Live Feed** — real-time employee activity with latest screenshots
- **Timesheets** — aggregated time entries by employee, project, date
- **Screenshots** — timeline view with filters, grouped by hour
- **App Usage** — hours by app with productivity breakdown, click for window/URL details
- **Reports** — activity, time by project, app usage, employee earnings
- **Projects** — hourly/fixed budget, member assignment with rates
- **Clients** — per-client currency & tax rate, linked projects
- **Invoices** — generate from tracked time, download as PDF, status management
- **Members** — invite, role assignment, per-user monitoring settings, salary
- **My Dashboard** — personal stats, hours by project/employee, recent screenshots

### Roles & Permissions
- Custom roles — create Team Lead, Finance, HR, Contractor, etc.
- 22 granular permissions across 5 categories
- Permission toggle matrix per role in Settings
- Owner always has full access (enforced in code)
- Sidebar auto-hides menu items based on permissions

### Billing
- Per-client currency (USD, EUR, GBP, INR, AED, etc.) and tax rate
- Hourly and fixed-budget project types
- Invoice generation from approved time entries
- Duplicate invoice prevention (overlapping date ranges)
- Invoice download as printable HTML/PDF
- Status workflow: Draft → Sent → Paid

### Storage
- Screenshots stored locally by default
- Optional S3 storage (AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2)
- Configurable root folder prefix from Settings UI

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 16+

### Setup

```bash
# Clone
git clone https://github.com/HiteshR90/time-logger.git
cd time-logger

# Install dependencies
pnpm install

# Create database
psql -U postgres -c "CREATE DATABASE timetracker;"
psql -U postgres -c "CREATE USER timetracker WITH PASSWORD 'timetracker';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE timetracker TO timetracker;"
psql -U postgres -c "ALTER USER timetracker CREATEDB;"

# Configure environment
cp packages/api/.env.example packages/api/.env
# Edit .env with your database URL

# Run migrations
cd packages/api && npx prisma migrate dev && cd ..

# Build shared package
pnpm turbo build --filter=@time-tracker/shared
```

### Run All Services

```bash
./start.sh
```

This starts:
- **API** on http://localhost:5080
- **Dashboard** on http://localhost:3000
- **Electron Agent** (desktop window)

### Build Desktop App (DMG)

```bash
cd packages/agent
bash scripts/prepare-native.sh
npx electron-vite build
npx electron-builder --mac
# Output: packages/agent/release/TimeTracker-0.1.0-arm64.dmg
```

## Environment Variables

```env
# packages/api/.env
DATABASE_URL="postgresql://timetracker:timetracker@localhost:5432/timetracker"
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5080

# Optional: S3 storage (can also configure from Settings UI)
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="time-tracker-screenshots"

# Optional: Email (invite notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
```

## API Endpoints

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/invite`, `/accept-invite`, `GET /auth/me` |
| Users | `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `GET /users/:id/monitoring-settings` |
| Roles | `GET /roles`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id` |
| Projects | `GET /projects`, `POST`, `PATCH`, `DELETE`, `POST /:id/members`, `DELETE /:id/members/:userId` |
| Clients | `GET /clients`, `POST`, `PATCH`, `DELETE` |
| Activity | `POST /activity/ingest` |
| Screenshots | `POST /screenshots/presigned-url`, `/confirm`, `GET /screenshots`, `GET /screenshots/file/:id` |
| Timesheets | `GET /timesheets`, `POST /manual`, `PATCH /:id/approve`, `PATCH /:id/reject` |
| Invoices | `GET /invoices`, `POST /generate`, `PATCH /:id`, `PATCH /:id/status`, `DELETE /:id` |
| Reports | `GET /reports/activity`, `/time-by-project`, `/app-usage`, `/employee-earnings` |
| Org | `GET /organizations/me`, `PATCH /organizations/settings` |

## Database Schema

14 tables: organizations, roles, users, departments, clients, projects, project_members, time_entries, activity_snapshots, app_usage_logs, screenshots, invoices, invoice_line_items, refresh_tokens, invite_tokens

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **API**: Express, TypeScript, Prisma ORM, JWT, Zod validation
- **Dashboard**: Next.js 14 (App Router), Tailwind CSS, React Query, Recharts, Socket.io
- **Agent**: Electron, desktopCapturer, active-win, SQLite offline queue
- **Database**: PostgreSQL
- **Storage**: Local filesystem + optional S3-compatible

## License

Private — all rights reserved.
