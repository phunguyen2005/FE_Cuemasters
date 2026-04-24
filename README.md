# CueMasters — Frontend

React + TypeScript SPA for the CueMasters billiards booking platform. Provides customer booking flows, admin dashboards, and real-time table status.

**Stack:** React 19 · TypeScript · Vite · TailwindCSS · Zustand · SignalR · Axios · Google OAuth

---

## Prerequisites

| Tool | Minimum Version | Check |
|------|----------------|-------|
| [Node.js](https://nodejs.org/) | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| [Docker & Docker Compose](https://docs.docker.com/get-docker/) | Latest | Only for Docker path |

---

## Option A — Docker

Builds the app with Nginx in a container.

```bash
# 1. Copy and fill in environment variables
cp .env.example .env
# Edit .env — see Environment Variables section below

# 2. Build and run (from the repo root or this folder)
docker-compose up --build frontend
```

App is available at **http://localhost:3000**

---

## Option B — Local Development

### 1. Clone and install

```bash
git clone <repo-url>
cd FE_Cuemasters_clean
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set:

```env
# Backend API base URL — must match the running backend
VITE_API_URL=http://localhost:5000/api

# Google OAuth client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# OAuth redirect URL — must match what is registered in Google Cloud Console
VITE_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Optional — enables the AI assistant feature
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run

```bash
npm run dev
```

App is available at **http://localhost:3000**

---

## Environment Variables

Copy `.env.example` to `.env`.

| Variable | Example | Required | Description |
|----------|---------|----------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Yes | Backend API base URL. Must be in the backend's CORS allowed origins. |
| `VITE_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Yes | Google OAuth 2.0 client ID. |
| `VITE_GOOGLE_REDIRECT_URI` | `http://localhost:3000/auth/google/callback` | Yes | OAuth callback URL. Must match Google Cloud Console configuration. |
| `GEMINI_API_KEY` | `AIzaSy...` | No | Google Gemini API key for the AI assistant feature. |

> **Note:** All `VITE_*` variables are embedded at build time by Vite. Never put secrets in `VITE_*` variables — they will be visible in the browser.

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID of type **Web application**.
3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:3000
   ```
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copy the **Client ID** into `VITE_GOOGLE_CLIENT_ID` in your `.env`.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR on port 3000 |
| `npm run build` | Production build into `/dist` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | TypeScript type check (no emit) |
| `npm run clean` | Remove the `/dist` folder |

---

## Project Structure

```
FE_Cuemasters_clean/
├── src/
│   ├── pages/
│   │   ├── admin/           # Admin dashboard (tables, F&B, analytics)
│   │   ├── staff/           # Staff table management interface
│   │   ├── Home.tsx         # Landing page
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx     # Registration
│   │   ├── FloorPlan.tsx    # Interactive table booking map
│   │   ├── Membership.tsx   # Membership plans & purchase
│   │   ├── Coaches.tsx      # Coach listing & booking
│   │   ├── BookingHistory.tsx
│   │   ├── Settings.tsx     # User account settings
│   │   └── ...
│   ├── components/
│   │   ├── auth/            # Login form, OAuth button, guards
│   │   ├── layout/          # Header, footer, sidebar
│   │   └── ...              # Shared UI components
│   ├── stores/              # Zustand global state
│   │   ├── authStore.ts     # Auth state (user, JWT token)
│   │   ├── bookingStore.ts  # Booking/reservation state
│   │   ├── tableStore.ts    # Table availability
│   │   ├── membershipStore.ts
│   │   ├── coachStore.ts
│   │   └── fnbStore.ts
│   ├── services/            # Axios API clients + SignalR setup
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript interfaces
│   └── utils/               # Date formatting, helpers
├── vite.config.ts           # Vite config (aliases, plugins, env)
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies & scripts
├── .env.example             # Environment variable template
├── Dockerfile               # Multi-stage Node → Nginx container
└── nginx.conf               # Nginx SPA config (used in Docker)
```

---

## Connecting to the Backend

The frontend communicates with the backend via:

- **REST API** — all requests go to `VITE_API_URL`. Make sure the backend is running and that origin (`http://localhost:3000`) is in the backend's CORS allowed origins.
- **SignalR** — connects to `<backend-host>/hubs/tablestatus` for real-time table updates.

Default ports:

| Service | URL |
|---------|-----|
| Frontend dev server | http://localhost:3000 |
| Backend API (local) | http://localhost:5000/api |
| Backend API (Docker) | http://localhost:9080/api |

---

## Troubleshooting

**`npm install` fails**
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then retry: `rm -rf node_modules package-lock.json && npm install`

**Blank page or API errors in browser**
- Check that `VITE_API_URL` in `.env` points to the running backend.
- Open browser DevTools → Network tab to see which requests are failing.
- Verify the backend has `http://localhost:3000` in its CORS allowed origins.

**Google login does not work**
- Ensure `VITE_GOOGLE_CLIENT_ID` is set correctly.
- Verify `http://localhost:3000` and `http://localhost:3000/auth/google/callback` are registered in Google Cloud Console.
- After changing `.env`, restart the dev server.

**Real-time table status not updating**
- Check that the backend SignalR hub is reachable at `<VITE_API_URL_host>/hubs/tablestatus`.
- Look for WebSocket connection errors in browser DevTools → Console.
