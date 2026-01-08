# Research & Design Decisions: Authenticated Web-Based Todo Application

**Phase**: 0 – Outline & Research  
**Date**: 2026-01-07  
**Feature**: Authenticated Web-Based Todo Application (001-build-auth-todo)

---

## 1. Authentication Strategy: Better Auth

### Decision
**Integrate Better Auth** as the single source of truth for user identity and session management.

### Rationale
- **Native Next.js support**: Better Auth provides seamless integration with Next.js App Router via auth middleware and client libraries.
- **Token-based architecture**: Issues JWT or opaque tokens that the backend can validate server-side without a separate credential store.
- **User metadata**: Encodes `user_id` and email in the token, enabling the API to derive the canonical identity from every request.
- **Session management**: Handles token refresh, expiry, and re-auth flows automatically on the frontend.
- **Serverless-friendly**: Stateless token validation aligns with Neon's serverless model and FastAPI's stateless design.

### Alternatives Considered
- **NextAuth.js**: Coupled tightly to Next.js, requires a separate credential database (more complex).
- **Auth0**: Vendor lock-in, higher cost, overkill for a single-app use case.
- **Custom JWT**: Increases security surface, requires manual token management and refresh logic.
- **Session cookies**: Requires backend session store or sticky load balancing; incompatible with serverless Neon model.

### Implementation Approach
1. Configure Better Auth in the frontend with app credentials.
2. Store Better Auth token in NextAuth session.
3. Backend validates the token on every request via an auth dependency in FastAPI.
4. Extract `user_id` from token claims and enforce path parameter matching.

---

## 2. Database: Neon Serverless PostgreSQL

### Decision
**Use Neon Serverless PostgreSQL** for task data persistence.

### Rationale
- **Scalability**: Serverless model scales to zero, ideal for variable load in a learning/prototype phase.
- **SQL standard**: PostgreSQL with Neon's HTTP API or direct psycopg2 connection via pooling.
- **SQLModel compatibility**: SQLModel (SQLAlchemy ORM) natively targets PostgreSQL.
- **Cost-effective**: Pay for compute only when in use; generous free tier for development.
- **Managed infrastructure**: No maintenance overhead, automatic backups, built-in monitoring.
- **Per-user isolation**: Schema or row-level security (RLS) can enforce data isolation at the database level.

### Alternatives Considered
- **MongoDB**: NoSQL, document-based; adds complexity for relational task data and RLS.
- **SQLite**: File-based, not suitable for multi-user web apps or serverless Neon-style architecture.
- **Firebase/Firestore**: Vendor lock-in, different query model, less control over per-user data access.
- **MySQL**: Functionally equivalent to PostgreSQL; Neon's serverless advantage is PostgreSQL-specific.

### Implementation Approach
1. Define PostgreSQL connection pool (via pgbouncer or Neon's built-in pooling).
2. Use SQLModel to define Task schema with `user_id` foreign key or row-level security.
3. Initialize migrations via Alembic on first deployment.
4. Enforce `user_id` validation at the API layer (defense in depth).

---

## 3. Backend Framework: FastAPI with SQLModel

### Decision
**Build the backend with FastAPI** and **model entities with SQLModel**.

### Rationale
- **Performance**: FastAPI is async-first and among the fastest Python frameworks (near-native speeds).
- **Modern async/await**: Built on Starlette + Pydantic; integrates seamlessly with async database drivers.
- **Dependency injection**: FastAPI's `Depends()` pattern enables reusable auth validation and database session injection.
- **Automatic documentation**: FastAPI generates OpenAPI/Swagger docs automatically.
- **SQLModel**: Combines SQLAlchemy ORM with Pydantic validation in a single schema, reducing boilerplate.
- **Type safety**: Full type hints throughout the stack for better IDE support and fewer runtime errors.

### Alternatives Considered
- **Django + Django REST Framework**: Full-stack, heavier, more batteries-included; overkill for a REST API.
- **Flask**: Lightweight but lacks async support and dependency injection; slower for I/O-bound workloads.
- **GraphQL (Strawberry/Ariadne)**: Adds complexity; REST is simpler and matches the spec's explicit "REST-only" constraint.

### Implementation Approach
1. Initialize FastAPI app with CORS, exception handling, and logging.
2. Define SQLModel entities for Task (inheriting from both SQLModel and ORM base).
3. Create endpoints for CRUD + task completion toggle.
4. Inject `Depends(validate_token)` into every route to enforce auth.

---

## 4. Frontend Framework: Next.js 16+ (App Router)

### Decision
**Build the UI with Next.js 16+ using the App Router** and **style with Tailwind CSS**.

### Rationale
- **React foundation**: Component-driven UI with hooks and state management patterns.
- **App Router**: File-based routing (pages, API routes) is intuitive and reduces boilerplate.
- **Server Components**: Can offload some auth checks to the server layer.
- **Built-in API routes**: Can proxy calls to the backend or handle middleware authentication.
- **Vercel deployment**: First-class support for serverless deployment alongside Neon.
- **Tailwind CSS**: Utility-first CSS; pairs well with Next.js; responsive design by default.
- **SWR / React Query**: Simplifies data fetching, caching, and real-time state sync without WebSockets.

### Alternatives Considered
- **Vite + React**: Lighter, faster build times; but no built-in routing or server-side auth helpers.
- **Vue.js / Nuxt**: Less relevant in this ecosystem; would require custom Next.js-compatible setup.
- **Native mobile (React Native / Flutter)**: Out of scope; user requested web UI.

### Implementation Approach
1. Initialize Next.js 16+ with TypeScript template.
2. Set up Better Auth client in `app/layout.tsx` with auth provider wrapper.
3. Create dashboard page with protected route (redirects to login if not authenticated).
4. Build TaskList, TaskForm, TaskItem components using React hooks.
5. Use fetch() or SWR for API calls with error boundaries and loading states.
6. Style with Tailwind CSS utility classes; responsive breakpoints for mobile/tablet/desktop.

---

## 5. API Design: REST with User-Scoped Routes

### Decision
**Use RESTful endpoints with user ID in the path** (e.g., `/api/{user_id}/tasks`).

### Rationale
- **Explicit user scoping**: `user_id` in the URL makes the access control boundary clear.
- **Server-side validation**: Backend verifies that the authenticated user's ID matches the path parameter on every request.
- **Stateless design**: No session store; every request carries the user identity in the token.
- **Standard HTTP semantics**: Leverages GET/POST/PUT/PATCH/DELETE for CRUD operations.
- **Cache-friendly**: Per-user URLs enable granular HTTP caching strategies (with appropriate Cache-Control headers).

### Endpoint Specification
```
GET    /api/{user_id}/tasks              → Fetch all tasks for user
POST   /api/{user_id}/tasks              → Create a new task
GET    /api/{user_id}/tasks/{task_id}    → Fetch a specific task
PUT    /api/{user_id}/tasks/{task_id}    → Update a task's description/due_date
PATCH  /api/{user_id}/tasks/{task_id}/complete → Toggle completed flag
DELETE /api/{user_id}/tasks/{task_id}    → Delete a task
```

### Alternatives Considered
- **User ID in headers**: Less discoverable; path-based is more RESTful.
- **Query parameters**: `/api/tasks?user_id=...` is less secure (easier to enumerate users).
- **GraphQL**: Violates the explicit "REST-only" constraint in the spec.
- **Webhooks / Real-time pushes**: Spec explicitly excludes real-time updates.

### Implementation Approach
1. Define request/response schemas in SQLModel.
2. Implement endpoint handlers with `Depends(validate_token)` to extract user ID.
3. Compare token's user ID with path parameter; return 403 if mismatch.
4. Return structured error responses with HTTP status and message.

---

## 6. Error Handling & Validation

### Decision
**Centralized error handling with structured JSON responses**.

### Rationale
- **Consistency**: All endpoints return the same error shape so the frontend can handle errors uniformly.
- **Clarity**: Include an error code, message, and optional details (e.g., validation errors) for each failure.
- **Security**: Never expose internal stack traces or database details in responses.
- **Retryability**: Distinguish 4xx (client error, do not retry) from 5xx (server error, retry with backoff).

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task description must not exceed 200 characters.",
    "details": {
      "field": "description",
      "constraint": "max_length"
    }
  },
  "status": 400
}
```

### Implementation Approach
1. Define a custom exception class in FastAPI.
2. Register an exception handler that converts the exception to a structured JSON response.
3. Use Pydantic's validation to auto-generate detailed field errors.
4. Log all 5xx errors to a monitoring service (e.g., Sentry) for debugging.

---

## 7. Testing Strategy

### Decision
**Three-tier testing**: unit (models/logic), integration (API endpoints), contract (auth + CRUD).

### Rationale
- **Unit tests**: Fast, validate business logic in isolation (e.g., task state transitions).
- **Integration tests**: Test the full API stack (auth, DB, response format) against a test database.
- **Contract tests**: Verify the API contracts match the frontend's expectations (schema, status codes).
- **End-to-end tests**: Simulate real user workflows (sign up, create tasks, refresh page).

### Tools
- **Backend**: pytest, pytest-asyncio (async support), pytest-cov (coverage).
- **Frontend**: Vitest, React Testing Library (component tests), Playwright (e2e).

### Implementation Approach
1. Create fixtures for test data (users, tasks).
2. Use a test database (separate Neon project or SQLite in-memory for speed).
3. Mock Better Auth tokens in tests with known claims.
4. Write integration tests for each endpoint with valid/invalid tokens and user IDs.
5. Test error cases (missing fields, 403, 404, 500).

---

## 8. Deployment & Infrastructure

### Decision
**Separate Vercel (frontend) and a cloud provider (backend)** (e.g., Render, Railway, or AWS Lambda/ECS for FastAPI).

### Rationale
- **Deployment separation**: Frontend and backend deploy independently; frontend can be redeployed without downtime to the API.
- **Scaling**: Backend scales based on API load; frontend is static/cached.
- **Cost**: Vercel free tier covers the frontend; backend can be on a cheap tier and scale up if needed.
- **Environment isolation**: Dev, staging, and production can have separate database and API endpoints.

### Environment Configuration
- **Frontend**: Env vars for API endpoint URL, Better Auth client ID/secret.
- **Backend**: Env vars for Neon connection string, Better Auth secret, CORS origins.
- **Database**: Separate Neon projects for dev, staging, production.

### Implementation Approach
1. Add `vercel.json` to frontend for deployment configuration.
2. Create a Dockerfile for the backend (FastAPI + Python dependencies).
3. Set up CI/CD (GitHub Actions) to run tests, build, and deploy on push.
4. Store secrets in environment variable managers (Vercel Secrets, GitHub Secrets, cloud provider secrets).

---

## 9. Security Hardening

### Decision
**Enforce authentication on every endpoint, validate token claims, and isolate data by user**.

### Rationale
- **No anonymous access**: Every API endpoint requires a valid Better Auth token.
- **Token validation**: Backend verifies the token's signature and expiry on every request.
- **User isolation**: Path parameter and token claims must match; return 403 if they don't.
- **CORS**: Frontend origin is whitelisted to prevent CSRF attacks.
- **Logging**: All auth failures (invalid token, 403) are logged for security audits.

### Implementation Approach
1. Define a `validate_token` dependency in FastAPI that extracts and validates the Better Auth token.
2. Raise a 403 exception if the token is missing, invalid, or expired.
3. Configure FastAPI's CORS middleware with the frontend's Vercel domain.
4. Log all failed auth attempts to a monitoring service.
5. Use HTTPS everywhere (automatic on Vercel and cloud providers).

---

## Unknowns Resolved

| Unknown | Resolution | Source |
|---------|-----------|--------|
| Authentication mechanism | Better Auth with JWT tokens | Spec requirement; industry standard for NextAuth/FastAPI |
| Database choice | Neon Serverless PostgreSQL | Spec requirement; aligns with serverless, multi-user scale |
| Backend framework | FastAPI + SQLModel | Fast, async-first, type-safe, dependency injection |
| Frontend framework | Next.js 16+ (App Router) + Tailwind CSS | Spec requirement; responsive, server components for auth |
| API design | REST with user-scoped routes | Spec requirement; stateless, cache-friendly, standard HTTP |
| Validation/error handling | Structured JSON responses with codes | Best practice for client-side error handling |
| Testing | Unit + integration + contract tests | Ensures correctness and prevents regressions |
| Deployment | Vercel (frontend) + cloud provider (backend) | Separate scaling, easy CI/CD, free/cheap tier coverage |
| Security | Token validation on every endpoint + user ID matching | Defense in depth, prevents cross-user data access |

---

## Summary

This research has resolved all technical unknowns and documented best-practice rationale for:
- **Authentication**: Better Auth (stable, Next.js-native, token-based)
- **Storage**: Neon Serverless PostgreSQL (scalable, managed, cost-effective)
- **Backend**: FastAPI + SQLModel (fast, async, type-safe)
- **Frontend**: Next.js 16+ with Tailwind CSS (responsive, server components, deployment-friendly)
- **API**: REST with user-scoped routes (stateless, secure, standard)
- **Testing**: Unit + integration + contract tiers (comprehensive, maintainable)
- **Deployment**: Vercel + cloud provider (separate scaling, CI/CD automation)
- **Security**: Token validation + user ID matching (multi-layered, no data leaks)

**Next phase (Phase 1)**: Generate data-model.md, API contracts, and quickstart.md.
