# Communest Backend

Express.js API for the Communest frontend. It uses Supabase Auth for users and a Supabase service-role client for database operations.

## Requirements

- Node.js 18 or newer
- npm or pnpm
- A Supabase project with the Communest schema applied
- The Supabase service-role secret from Project Settings -> API

## Setup

From the repository root:

```bash
cd backend
npm install
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Open `backend/.env` and set `SUPABASE_SERVICE_ROLE_KEY`. Keep this secret out of source control. The remaining defaults target the local frontend and the Communest Supabase project:

```env
PORT=5000
SUPABASE_URL=https://jmcuzdzijjdmdvpahixk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
FRONTEND_URL=http://localhost:5173
```

For development, requests from private-network IP addresses on ports `5173` or
`8443` are also allowed automatically. In production, set `FRONTEND_URL` to the
exact frontend origins that should be trusted.

Apply the migrations in `supabase/migrations/` in filename order through the
Supabase SQL editor or your normal migration workflow. The
`20261126000100_data_access_indexes.sql` migration adds read indexes without
changing or deleting existing records. The
`20261126000200_create_profile_on_signup.sql` migration creates each new user's
profile through a database trigger, so registration does not need a direct
insert into the RLS-protected `profiles` table. The
`20261126000300_detach_records_on_account_deletion.sql` migration lets an
account be deleted without removing its estate or inquiry records.

## Run

Development mode with automatic restart:

```bash
npm run dev
```

Production-style local start:

```bash
npm start
```

Run the dependency-free smoke tests:

```bash
npm test
```

Seed realistic demo accounts and estate workflows into the Supabase project
configured in `backend/.env`:

```powershell
$env:DEMO_SEED_CONFIRM = "YES"
$env:DEMO_PASSWORD_COMMUNEST_ADMIN = "<Communest admin password>"
$env:DEMO_PASSWORD_REGULAR_USER = "<Regular user password>"
$env:DEMO_PASSWORD_ESTATE_ADMIN = "<Estate admin password>"
$env:DEMO_PASSWORD_TENANT = "<Tenant password>"
npm run seed:demo
```

The script refuses to overwrite accounts not marked as demo users and prints
the login details after all records are created. It creates three approved
estates, one Communest Admin, one regular user, three estate admins, and six
tenants. Accounts share the password assigned to their role. Guests browse
without signing in and have no login password.

The API runs at `http://localhost:5000`. Check it with:

```bash
curl http://localhost:5000/health
```

## Connect the frontend

Create or update a `.env` file at the repository root:

```env
VITE_BASE_API=http://localhost:5000/api
```

The frontend API helper reads `VITE_BASE_API` from the root `.env` file. To use the Supabase Edge Function instead, set it to:

```ts
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5d5fb4b7`;
```

Then run the frontend from the repository root with `pnpm install` followed by `pnpm dev`.

## API areas

- `/api/auth` registration, login, logout
- `/api/profile` profile read/update/delete
- `/api/estates` public estate discovery and estate submission/admin status actions
- `/api/estates/:estateId/houses` and `/api/houses/:id/*` house management
- `/api/proposals` public rental applications and estate-admin review
- `/api/estates/:estateId/notifications`
- `/api/estates/:estateId/maintenance`
- `/api/estates/:estateId/payment-options`
- `/api/estates/:estateId/inquiries`
- `/api/admin` Communest Admin operations

Protected requests must include `Authorization: Bearer <supabase-access-token>`. Every error is returned as `{ "message": "..." }`.

## Security notes

The service-role key bypasses Supabase Row Level Security and must only be used by this backend. Never put it in frontend environment variables or commit `backend/.env`. The server verifies Supabase access tokens on protected routes and checks both role and estate ownership for estate-admin actions.

To manually remove an account in Supabase, delete the user from **Authentication
→ Users**. The `profiles.id` foreign key cascades that deletion to the profile
row. Deleting only the row from `public.profiles` leaves the Auth user in place,
so its email remains unavailable for registration.
