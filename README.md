# SupportDesk AI

SupportDesk AI is a full-stack ticket management platform with role-based customer and agent workflows, real-time updates, file uploads, notifications, and a context-aware AI assistant.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, RTK Query, Framer Motion, Recharts, Socket.IO Client
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- AI and voice: Gemini, AssemblyAI, Murf
- Storage and media: Cloudinary
- Security: HTTP-only cookie auth, JWT access/refresh tokens, RBAC, Helmet, CORS, rate limiting, request sanitization

## Core Features

- Customer registration and login
- HTTP-only cookie authentication
- Role-based customer and agent access
- Customer ticket CRUD with attachments
- Agent ticket dashboard, filtering, assignment, status, and priority updates
- Ticket comments and activity timeline
- Real-time ticket updates, typing indicators, presence, and notifications
- AI assistant that reads only the logged-in customer's ticket context
- Voice transcription and text-to-speech support
- Cloudinary-backed attachment uploads
- Audit logging and API documentation setup

## Project Structure

```text
client/
  src/
    app/                 Redux store and API slices
    components/          Shared UI components
    features/            Feature modules: tickets, agent, AI, notifications
    hooks/               Shared frontend hooks
    layouts/             Auth, customer, and agent layouts
    lib/                 Local SPA router compatibility layer
    pages/               Top-level public pages
    socket/              Socket.IO client setup and provider
    utils/               Axios and shared utilities

server/
  src/
    config/              Database, Redis, Swagger config
    controllers/         Request handlers
    middlewares/         Auth, validation, upload, security, error handling
    models/              Mongoose schemas
    routes/              API routes
    services/            Business logic and third-party integrations
    socket/              Socket.IO auth, rooms, events
    utils/               Constants, token helpers, Cloudinary, response helpers
    validators/          Express-validator rules
```

## Environment Variables

Create environment files from the examples in each app folder.

Backend commonly needs:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
GEMINI_API_KEY=
ASSEMBLYAI_API_KEY=
MURF_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Frontend commonly needs:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

## Running Locally

Install and run the backend:

```bash
cd server
npm install
npm run dev
```

Install and run the frontend:

```bash
cd client
npm install
npm run dev
```

## Running With Docker

The root `docker-compose.yml` starts MongoDB, Redis, the Express API, and the built React frontend.

Make sure `server/.env` exists before starting the stack. For local Docker over HTTP, keep:

```env
COOKIE_SECURE=false
CLIENT_URL=http://localhost:5173
```

Start the full stack:

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- API docs: `http://localhost:5000/api-docs`

Stop the stack:

```bash
docker compose down
```

Remove database/cache volumes:

```bash
docker compose down -v
```

## Verification

Frontend:

```bash
cd client
npm run lint
npm run build
npm audit --audit-level=high
```

Backend:

```bash
cd server
npm run check
npm audit --audit-level=high
```

## Architecture Notes

- Backend follows a controller-service-model pattern with validators and shared middleware.
- Customer ticket access is scoped by authenticated user ID to prevent cross-user data leakage.
- The AI prompt builder fetches recent, open, resolved tickets and latest comments only for the logged-in customer.
- Socket.IO joins authenticated users to user, agent, and ticket rooms, with room-level access checks.
- The frontend is organized by feature and uses RTK Query for server state.
- A local SPA router is used to avoid a React Router security advisory while preserving the subset of routing APIs used by this app.

## Known Improvement Areas

- Add full automated tests: unit, integration, API, and frontend component tests.
- Hash refresh tokens before storing them in MongoDB.
- Add admin workflows for agent creation and user management.
- Add OpenAPI coverage for every endpoint.
- Add stronger observability with structured logs, request IDs, metrics, and tracing.
- Add background jobs for email/AI/audio work instead of running everything inside request handlers.
- Replace the local router with a maintained router once the upstream security advisory has a clean stable fix.
- Add Dockerfiles and a production deployment guide for both apps.

## Interview Positioning

This project is stronger than a typical college project because it includes authentication, RBAC, real-time events, AI context isolation, uploads, audits, and a polished frontend. It is closest to a junior-to-early-mid full-stack portfolio project. To present it as mid-level production work, add meaningful tests, monitoring, CI, documented deployment, and stronger token/session hardening.
