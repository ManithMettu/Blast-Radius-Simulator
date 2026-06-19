# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Dashboard│ │ Services │ │  Graph   │ │  Simulations  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       │            │            │               │            │
│  ┌────┴────────────┴────────────┴───────────────┴────────┐  │
│  │ TanStack Query │ Zustand │ Axios │ Socket.io Client   │  │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP / WebSocket
┌───────────────────────────┼─────────────────────────────────┐
│                     Backend (Express)                        │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │ Routes → Controllers → Services → Repositories         │  │
│  └────────────────────────┬──────────────────────────────┘  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │ Graph Engine (blast-radius, cycles, paths, scoring)  │  │
│  └────────────────────────┬──────────────────────────────┘  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │ Prisma ORM │ Socket.io Server │ Middleware            │  │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │  PostgreSQL   │
                    └───────────────┘
```

## Component Interactions

### Service Lifecycle
1. User creates a service via the frontend form
2. Request validated by Zod middleware → `ServiceService.create()`
3. Prisma persists to `Service` table
4. TanStack Query invalidates cache → UI refreshes

### Dependency Graph
1. Dependencies stored as directed edges: `dependentId → dependencyId`
2. Graph engine builds an in-memory directed graph using `graphlib`
3. React Flow renders nodes (services) and edges (dependencies)
4. Simulation overlays highlight failed (red) and impacted (amber) nodes

### Failure Simulation Flow
1. User selects one or more services to fail
2. `POST /api/simulations/run` triggers blast-radius computation
3. BFS traverses predecessors (services that depend on failed nodes)
4. For each impacted service: compute depth, paths, severity score
5. Socket.io streams `simulation:progress` events in real-time
6. Final result persisted to `Simulation` table as JSON
7. Frontend updates graph, blast radius panel, and history

## Design Decisions

### Why separate graph engine?
The blast-radius, cycle-detection, and path-finding logic lives in `backend/src/engine/` as pure functions with no database or HTTP dependencies. This makes the core algorithms unit-testable and reusable.

### Why BFS for blast radius?
Breadth-first search from failed nodes through predecessor edges naturally computes the minimum dependency depth for each impacted service, which feeds directly into severity scoring.

### Why Socket.io over SSE?
Simulations may involve multiple progress events per run. Socket.io provides bidirectional communication and room-based broadcasting if multi-user support is added later.

### Why TanStack Query?
Server state (services, dependencies, simulations) benefits from caching, background refetching, and automatic invalidation after mutations — reducing boilerplate vs raw fetch + useState.

### Why Zustand for simulation state?
Client-only state (selected services, active results, highlighted paths) doesn't belong in the server cache. Zustand provides lightweight reactive state without provider nesting.

## Database Schema

```
Service
├── id, name (unique), description, owner
├── criticality (LOW|MEDIUM|HIGH|CRITICAL)
├── status (HEALTHY|DEGRADED|FAILED)
└── timestamps

Dependency
├── dependentId → Service (the service that depends)
├── dependencyId → Service (the service being depended on)
└── unique(dependentId, dependencyId)

Simulation
├── failedServiceIds[]
├── totalImpacted, severityScore
├── results (JSON — full SimulationResult)
└── createdAt
```

## Scalability Considerations

| Concern | Current approach | Scale path |
|---------|-----------------|------------|
| Graph computation | In-memory per request | Cache graph topology; incremental updates on dependency changes |
| Database | Single PostgreSQL instance | Read replicas for list queries; connection pooling (PgBouncer) |
| Real-time | Single Socket.io server | Redis adapter for horizontal scaling |
| API throughput | In-process rate limiting (120 req/min) | Move to Redis-backed rate limiter or API gateway |
| Pagination | Offset-based (page/pageSize) | Cursor-based for large simulation histories |

## Failure Handling

| Scenario | Handling |
|----------|----------|
| Circular dependency | Detected before creation; returns 400 with cycle path |
| Database unavailable | Health endpoint returns 503; frontend shows error state with retry |
| Invalid input | Zod validation returns 400 with field-level errors |
| Service not found | 404 with typed error code |
| Rate limit exceeded | 429 with retry guidance |
| Simulation failure | Socket.io emits `simulation:error`; frontend toast notification |
| Server crash | Graceful shutdown on SIGTERM/SIGINT; Prisma disconnect |

## Security

- Helmet.js security headers
- CORS restricted to configured frontend URL
- Request body size limited to 1MB
- Input validation on all endpoints via Zod
- Rate limiting on API routes
- Request ID tracing via `X-Request-Id` header
- No secrets in source code (env-based configuration)

## Production Middleware Stack

```
Request → Request ID → Helmet → CORS → Morgan → JSON Parser → Rate Limit → Routes → Error Handler
```
