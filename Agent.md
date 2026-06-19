# AI-Assisted Development Notes

## Tools Used

- **Cursor IDE** with Claude-based AI agent for architecture, implementation, and debugging
- AI used for scaffolding, code generation, and iterative refinement

## Development Approach

1. **Architecture first** — Designed monorepo structure with clear separation: graph engine, API layer, frontend components
2. **Frontend contract driven** — Backend API shaped to match frontend TanStack Query hooks and TypeScript types
3. **Iterative build** — Scaffold → core features → production hardening → documentation
4. **AI as pair programmer** — AI generated boilerplate and algorithms; human reviewed architecture decisions and trade-offs

## Key Prompts & Workflow

### Initial scaffolding
> "Build a production-level Dependency Blast Radius Simulator with Next.js frontend, Express backend, PostgreSQL, and graph visualization"

### Frontend
> "Use pnpm and TanStack Query with well-structured codebase as a senior developer"

### Backend
> "Build the backend also — make full set and ready for production"

### Production features
> "Include all production features" — added pagination, rate limiting, health checks, Docker, CI, error boundaries, toasts, skeletons, and documentation

## AI Contributions

| Area | AI role | Human role |
|------|---------|------------|
| Project structure | Generated folder layout and file scaffolding | Chose monorepo vs single-app, tech stack |
| Graph algorithms | Implemented BFS blast radius, cycle detection, path finding | Reviewed algorithm correctness and edge cases |
| API design | Generated REST routes matching frontend contract | Validated endpoint naming and response shapes |
| UI components | Built React components with Tailwind styling | Directed UX flow and feature priorities |
| Prisma schema | Generated models with relations and indexes | Confirmed data model matches domain |
| Docker/CI | Created Dockerfiles and GitHub Actions workflow | Chose port mappings and env strategy |
| Documentation | Drafted README, Architecture.md | Reviewed accuracy and completeness |

## Understanding the Codebase

I can explain:
- Why BFS is used for blast radius (minimum depth to impacted services)
- How cycle detection works (DFS from proposed dependency target back to dependent)
- How severity scoring combines depth, criticality, and path count
- The request flow: Route → Controller → Service → Repository → Prisma
- Real-time simulation: Socket.io events → Zustand store → React Flow highlighting
- Production middleware: request ID, rate limiting, DB health checks

## Trade-offs Accepted

- **No authentication** — Assessment scope; would add JWT/OAuth for production
- **In-memory rate limiting** — Sufficient for single-instance; Redis for multi-instance
- **Offset pagination** — Simple; cursor-based for very large datasets
- **Prisma 6 over 7** — Stability over latest features (Prisma 7 config changes)
- **Client-side graph layout** — Grid positioning; would use dagre/elk for auto-layout at scale
