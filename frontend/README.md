# Spendr (frontend)

This frontend is a Vite + React + TypeScript app using TailwindCSS, Material UI and Redux Toolkit Query (RTK Query).

Features included in this scaffold:
- Dashboard homepage that fetches a financial summary from backend `/api/movements/summary`.
- Movements list with filters (type, category, start/end dates) using `/api/movements`.
- Floating action button and dialog to create a new movement (`POST /api/movements`).

Requirements: the NodeJS backend must be running separately (default at http://localhost:3000). See the backend README provided by the backend project.

Run locally (Windows PowerShell):

```powershell
npm install
npm run dev
```

Run on Docker:

```bash
docker compose up frontend-dev --build
```

Notes:
- The RTK Query base URL is set to `http://localhost:3000/api` in `src/services/api.ts`. Change if your backend uses a different host/port.
- The scaffold focuses on minimal, functional wiring. Add authentication, validations, pagination and tests as next steps.
