# Blast Radius Simulator

A full-stack platform for modeling service dependencies, simulating failures, and analyzing blast radius across distributed systems.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TanStack Query/Table, React Flow, Zustand |
| Backend | Node.js, Express 5, TypeScript, Socket.io |
| Database | PostgreSQL, Prisma ORM |
| Infra | Docker, Docker Compose, GitHub Actions |

## Features

- **Service management** — CRUD with search, status/criticality/owner filters
- **Dependency mapping** — many-to-many relationships with cycle detection
- **Interactive graph** — React Flow visualization with impact highlighting
- **Failure simulation** — multi-service failure scenarios
- **Blast radius analysis** — direct + indirect impact via BFS graph traversal
- **Impact severity scoring** — depth, criticality, and path-weighted scoring
- **Dependency path exploration** — inspect exact failure cascade paths
- **Real-time updates** — Socket.io streaming during simulations
- **Simulation history** — persisted results with search and severity filters
- **Health dashboard** — service health overview with charts

## Quick Start (Development)

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker Desktop

### 1. Start database

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

API: http://localhost:4000

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

UI: http://localhost:3000

## Production (Docker)

```bash
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000 |
| PostgreSQL | localhost:5433 |

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/blast_radius?schema=public
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:api` | Start backend dev server (from root) |
| `pnpm dev:web` | Start frontend dev server |
| `pnpm build` | Build both apps |
| `npm run test` | Run backend tests (from root) |
| `pnpm db:up` | Start PostgreSQL |
| `npm run db:migrate` | Apply migrations (from root) |
| `npm run db:seed` | Seed sample data (from root) |
| `pnpm docker:up` | Full stack via Docker |

## API Endpoints

```
GET    /api/health              Health check (with DB status)
GET    /api/health/summary      Service health counts
GET    /api/services            List services (paginated, filterable)
POST   /api/services            Create service
PATCH  /api/services/:id        Update service
DELETE /api/services/:id        Delete service
GET    /api/dependencies        List dependencies
POST   /api/dependencies        Create dependency
POST   /api/dependencies/detect-cycle
GET    /api/graph               Graph nodes + edges
GET    /api/simulations         Simulation history (paginated)
POST   /api/simulations/run     Run failure simulation
```

## Tests

```bash
cd backend && npm test
```

## Assumptions

- Single-tenant deployment (no auth required for assessment scope)
- PostgreSQL is the primary data store
- Dependency direction: `dependent → depends on → dependency` (failure propagates upstream to dependents)
- Severity scoring uses depth decay, criticality weight, and path multiplicity
- Port 5433 used locally to avoid conflicts with existing PostgreSQL installations

## Documentation

- [Architecture.md](./Architecture.md) — system design and decisions
- [Agent.md](./Agent.md) — AI-assisted development notes
