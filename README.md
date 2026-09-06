# SupportDesk AI

SupportDesk AI is a full-stack ticket management system for customer support teams. Customers can raise tickets, upload proof files, chat with support, and use an AI assistant for ticket-related questions. Agents get dashboards for assignment, status updates, priority handling, real-time conversations, and activity tracking.

## What Problem It Solves

- Keeps customer issues, proof files, comments, and status history in one place.
- Helps agents manage open, assigned, and updated tickets without switching tools.
- Separates customer and agent workflows with role-based access.
- Reduces manual refreshes through real-time typing, presence, and notifications.
- Gives customers an AI assistant that answers using only their own ticket context.

## Features

- Customer signup, login, logout, and HTTP-only cookie authentication
- Role-based customer and agent pages
- Customer ticket create, list, detail, update, and delete flows
- Cloudinary-backed file uploads for tickets and comments
- Shared upload UI through `FileUploader.jsx`
- Shared customer/agent conversation UI through `ConversationThread.jsx`
- Separate `Details` and `Chat` actions for ticket lists
- Agent dashboard with filters, assignment, status updates, and priority updates
- Socket.IO real-time ticket rooms, typing indicators, presence, and notifications
- AI assistant with Gemini primary provider and Groq fallback
- AssemblyAI transcription and Murf text-to-speech support
- Redis-ready cache/rate-limit support
- Swagger API docs setup
- Docker setup for local full-stack runs
- EC2 deployment friendly backend/frontend structure

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Redux Toolkit, RTK Query, Framer Motion, Recharts, Socket.IO Client
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO
- AI and voice: Gemini, Groq, AssemblyAI, Murf
- Storage: Cloudinary
- Infrastructure: Docker, Nginx, PM2, GitHub Actions, EC2
- Security: JWT, HTTP-only cookies, RBAC, Helmet, CORS, rate limiting, request sanitization

## Project Structure

```text
client/
  src/
    app/                 Redux store and API slices
    components/          Shared UI components
    features/            Tickets, agent dashboard, AI, notifications
    hooks/               Shared frontend hooks
    layouts/             Auth, customer, and agent layouts
    lib/                 Local SPA router compatibility layer
    pages/               Public pages
    socket/              Socket.IO client setup
    utils/               Axios and shared utilities

server/
  src/
    config/              Database, Redis, Swagger config
    controllers/         Express controllers
    middlewares/         Auth, upload, validation, security, error handlers
    models/              Mongoose models
    routes/              API routes
    services/            Business logic and external integrations
    socket/              Socket.IO auth, rooms, events
    utils/               Constants, JWT, Cloudinary, response helpers
    validators/          express-validator rules
```

## Important Files

- `docker-compose.yml`: runs MongoDB, Redis, backend, and frontend together.
- `server/Dockerfile`: builds the backend container.
- `client/Dockerfile`: builds the frontend and serves it with Nginx.
- `server/src/smoke-test.js`: starts the backend on a temporary port and checks `/health`.
- `server/src/socket-smoke-test.js`: creates test users/ticket, authenticates sockets, joins ticket rooms, and verifies typing events.
- `server/src/ai-provider-check.js`: checks Gemini/Groq provider configuration from backend `.env`.
- `client/src/components/common/FileUploader/FileUploader.jsx`: shared upload UI for ticket forms, comments, and AI chat.
- `client/src/components/common/ConversationThread/ConversationThread.jsx`: shared conversation message UI.
- `client/src/features/tickets/components/CustomerTicketConversation.jsx`: reusable customer chat modal/page conversation.
- `client/src/features/agent/components/AgentTicketConversation.jsx`: reusable agent chat modal conversation.

## Environment Variables

Create environment files:

```bash
server/.env
client/.env
```

Backend commonly needs:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite
GROQ_API_KEY=
GROQ_MODEL=groq/compound-mini
ASSEMBLYAI_API_KEY=
MURF_API_KEY=
MURF_VOICE_ID=en-US-natalie
MURF_STYLE=Conversational
```

Frontend commonly needs:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

For local HTTP or EC2 without HTTPS:

```env
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

For HTTPS production:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

Never commit real `.env` files or API keys.

## Run Locally

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/health`
- API docs: `http://localhost:5000/api-docs`

## Verification Commands

Frontend build:

```bash
cd client
npm run build
```

Backend syntax check:

```bash
cd server
npm run check
```

Backend health smoke test:

```bash
cd server
npm run smoke
```

Socket.IO smoke test:

```bash
cd server
npm run smoke:socket
```

AI provider check:

```bash
cd server
npm run check:ai
```

Manual health check:

```bash
curl http://localhost:5000/health
```

## Smoke Test Files

`server/src/smoke-test.js` is for quick backend verification. It connects to MongoDB, starts the Express app on `SMOKE_TEST_PORT` or `5055`, calls `/health`, prints the response, and closes the server/database connection.

`server/src/socket-smoke-test.js` is for real-time verification. It creates temporary customer and agent users, creates a ticket, logs both users in, connects two Socket.IO clients, joins the ticket room, verifies typing events, then cleans up temporary users, tickets, and comments.

These files are useful for deployment checks and should stay in the backend.

## Run With Docker

The root `docker-compose.yml` starts:

- MongoDB
- Redis
- Express API
- React frontend served by Nginx

Start:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Remove database/cache volumes:

```bash
docker compose down -v
```

Docker URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/health`

## EC2 Deployment Notes

Recommended backend process command from the `server` folder:

```bash
pm2 start npm --name backend -- start
pm2 save
```

Useful EC2 checks:

```bash
pm2 list
pm2 logs backend --lines 50
curl http://localhost:5000/health
sudo ss -tulpn | grep 5000
```

If using Nginx on EC2, proxy API traffic to backend:

```nginx
location /api/ {
  proxy_pass http://localhost:5000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

location /socket.io/ {
  proxy_pass http://localhost:5000/socket.io/;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}

location / {
  try_files $uri $uri/ /index.html;
}
```

## API Overview

Common public endpoints:

- `GET /health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

Customer ticket endpoints:

- `GET /api/v1/tickets/my`
- `POST /api/v1/tickets`
- `GET /api/v1/tickets/:id`
- `PATCH /api/v1/tickets/:id`
- `DELETE /api/v1/tickets/:id`
- `GET /api/v1/tickets/:id/comments`
- `POST /api/v1/tickets/:id/comments`

AI endpoints are under:

```text
/api/v1/ai
```

Agent/dashboard routes handle ticket assignment, filtering, status changes, priority changes, overview metrics, activity, and notifications.

## Development Notes

- Backend follows controller-service-model structure.
- Frontend is feature-based and uses shared components for repeated UI.
- Ticket comments use `ConversationThread` so customer and agent chat stay visually consistent.
- File uploads use `FileUploader` so validation, progress, and preview behavior are consistent.
- Auth uses HTTP-only cookies, so frontend JavaScript should not manually store auth tokens.
- Socket.IO joins authenticated users to safe rooms based on role and ticket access.

## Known Improvement Areas

- Add unit and integration tests for backend services and routes.
- Add frontend component tests for ticket and chat flows.
- Hash refresh tokens before storing them.
- Add admin workflows for agent creation and user management.
- Expand Swagger/OpenAPI coverage.
- Add structured logging, request IDs, metrics, and tracing.
- Move heavy AI/audio work to background jobs.
- Add a full production deployment guide with HTTPS and domain setup.
