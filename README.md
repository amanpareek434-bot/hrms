# PeopleHub HRMS

A modern, fully functional Human Resource Management System with **landing page, authentication, and an admin console** — built with **Next.js 14 + TypeScript + Tailwind CSS + MySQL**.

## Pages

- **`/`** — Marketing landing page (hero, features, modules, workflow, FAQ, CTA)
- **`/signup`** — Create an admin account
- **`/login`** — Sign in
- **`/dashboard`** — Live KPIs, department headcount, pending leaves, recent joiners
- **`/employees`** — Full CRUD + CSV import (preview) + CSV export + template
- **`/attendance`** — Daily marking, time in/out, status, notes
- **`/leaves`** — Apply, approve / reject, filter
- **`/departments`** — Card-based CRUD with live headcount
- **`/payroll`** — Monthly generation, editable salary components, mark paid

All app routes (except `/`, `/login`, `/signup`) are protected by middleware that redirects unauthenticated users to `/login`.

---

## Setup

### 1) Create the database in MySQL Workbench

1. Open **MySQL Workbench** and connect to your local MySQL.
2. **File → Open SQL Script…** → select `database/schema.sql`.
3. Execute (`Ctrl + Shift + Enter`).
4. You should see a `peoplehub_hrms` schema with these tables:
   `users`, `departments`, `employees`, `attendance`, `leaves`, `payroll`.

Seed data is included: 5 employees, 5 departments, attendance, leaves, payroll.
The `users` table starts empty — you create your admin account from the signup page.

### 2) Configure credentials

Copy `.env.local.example` to `.env.local` and update:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=peoplehub_hrms

# Auth — replace with a long random string (min 32 chars)
JWT_SECRET=replace_me_with_long_random_string_at_least_32_chars
```

### 3) Install & run

```bash
npm install
npm run dev
```

Open **http://localhost:3000** → landing page → click **Get started free** → create your admin account.

---

## Authentication

- Passwords are hashed with **bcryptjs** (10 rounds).
- Sessions are signed JWTs (`jose`) stored in an **httpOnly cookie** (`hrms_session`).
- Middleware (`src/middleware.ts`) protects all dashboard routes.
- First signup creates an admin user; subsequent signups are also admins (single-tenant demo — change the role logic in `api/auth/signup/route.ts` to restrict).

### Auth endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account + sign in |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out (clears cookie) |
| GET  | `/api/auth/me` | Current user (or null) |

---

## CSV Import format (Employees)

Required columns: `firstName`, `lastName`, `email`. Full columns:
```
employeeCode, firstName, lastName, email, phone, department, designation, joiningDate, salary, status, address
```

Click **Template** on the Employees page to download a ready-to-fill CSV.

---

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/api/employees` | List / create |
| PUT / DELETE | `/api/employees/[id]` | Update / delete |
| POST | `/api/employees/import` | Bulk import |
| GET / POST | `/api/departments` | List / create |
| PUT / DELETE | `/api/departments/[id]` | Update / delete |
| GET / POST | `/api/attendance` | List (`?date=`) / upsert |
| GET / POST | `/api/leaves` | List / create |
| PATCH / DELETE | `/api/leaves/[id]` | Update status / delete |
| GET / POST | `/api/payroll` | List (`?month=`) / upsert |
| POST | `/api/payroll/generate` | Auto-generate for a month |

---

## Stack

- **Next.js 14** (App Router) + Route Groups + Middleware
- **TypeScript** strict mode
- **Tailwind CSS 3.4** with custom design tokens
- **MySQL 8** via `mysql2/promise` connection pool
- **bcryptjs** for password hashing
- **jose** for JWT signing/verification

---

## Project Structure

```
hrms/
├── database/
│   └── schema.sql              ← run in MySQL Workbench
├── src/
│   ├── middleware.ts           ← protects dashboard routes
│   ├── app/
│   │   ├── layout.tsx          ← root layout
│   │   ├── page.tsx            ← landing page
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── (app)/              ← route group (protected)
│   │   │   ├── layout.tsx      ← uses AppShell with sidebar
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── employees/page.tsx
│   │   │   ├── attendance/page.tsx
│   │   │   ├── leaves/page.tsx
│   │   │   ├── departments/page.tsx
│   │   │   └── payroll/page.tsx
│   │   └── api/                ← REST endpoints
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Modal.tsx
│   │   ├── StatCard.tsx
│   │   └── AuthCard.tsx
│   └── lib/
│       ├── db.ts               ← MySQL pool
│       ├── auth.ts             ← JWT + cookies
│       ├── csv.ts              ← parsing + export
│       ├── hrms.ts             ← API-backed React hooks
│       └── types.ts
└── package.json
```
