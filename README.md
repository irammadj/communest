# Communest

Communest is a housing and estate-management application with a React/Vite
frontend, an Express API, and Supabase authentication and database services.

## Requirements

- Node.js 18 or newer
- pnpm (recommended; the repository includes pnpm lockfiles)
- A Supabase project
- A Supabase service-role key for the backend

## Project structure

```text
communest/
├── backend/       Express API
├── frontend/      React/Vite application
├── supabase/      Database migrations
├── utils/         Shared Supabase configuration
├── package.json   Frontend scripts and dependencies
└── README.md      This file
```

## First-time setup

Clone the repository and open a terminal in the repository root:

```powershell
git clone https://github.com/irammadj/communest.git
cd communest
```

### 1. Configure the frontend

Install the frontend dependencies and create the root environment file:

```powershell
pnpm install
copy .env.example .env
```

The root `.env` should contain:

```env
VITE_BASE_API=http://localhost:5000/api
```

### 2. Configure Supabase

1. Create or select a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the migration in
   `supabase/migrations/20240001_communest_schema.sql`.
4. In Supabase, open **Project Settings → API** and copy the service-role
   secret. This secret is required by the backend and must never be exposed in
   frontend code.

### 3. Configure the backend

Install backend dependencies and create the backend environment file:

```powershell
cd backend
pnpm install
copy .env.example .env
```

Set the values in `backend/.env`:

```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:8443,http://127.0.0.1:8443
```

Return to the repository root before starting the application:

```powershell
cd ..
```

Do not commit either `.env` file. The service-role key bypasses Supabase Row
Level Security and must remain server-side.

## Run locally

Use two terminals, both opened at the repository root.

### Terminal 1: start the backend

```powershell
cd backend
pnpm run dev
```

The API is available at <http://localhost:5000>. Verify it with:

```powershell
Invoke-WebRequest http://localhost:5000/health
```

### Terminal 2: start the frontend

```powershell
pnpm dev
```

Open <http://localhost:8443> in a browser. The frontend reads
`VITE_BASE_API` from the root `.env` and sends API requests to the backend.

To stop either process, press `Ctrl+C` in its terminal.

## Useful commands

Run the backend smoke tests:

```powershell
cd backend
pnpm test
```

Create a production frontend build:

```powershell
cd ..
pnpm build
```

Preview the production frontend build:

```powershell
pnpm preview
```

Format the frontend source:

```powershell
pnpm format
```

## Troubleshooting

- **Frontend cannot reach the API:** confirm that the backend is running on
  port `5000` and that the root `.env` contains
  `VITE_BASE_API=http://localhost:5000/api`.
- **CORS errors:** make sure the frontend URL in `backend/.env` includes the
  URL shown in the browser, normally `http://localhost:8443`.
- **Authentication or database errors:** confirm that the Supabase migration
  has been applied and that `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` are correct.
- **Port already in use:** stop the process using port `8443` or `5000`, then
  start the affected service again.

## Security

Never commit secrets, especially `backend/.env` or a Supabase service-role
key. Only public Supabase configuration belongs in frontend code.
