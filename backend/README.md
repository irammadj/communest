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

Apply the existing migration in `supabase/migrations/20240001_communest_schema.sql` through the Supabase SQL editor or your normal Supabase migration workflow.

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
