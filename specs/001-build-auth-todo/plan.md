# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: Python 3.11+ (backend), Node.js 20+ / JavaScript (frontend)  
**Primary Dependencies**: FastAPI, SQLModel, Better Auth, Next.js 16+ (App Router)  
**Storage**: Neon Serverless PostgreSQL  
**Testing**: pytest (backend), Next.js testing library (frontend)  
**Target Platform**: Web (Linux/cloud backend, browser frontend)  
**Project Type**: Web application (separate frontend + backend)  
**Performance Goals**: <1.2 seconds p95 for 20 sequential CRUD actions per user  
**Constraints**: REST-only (no WebSockets), no real-time, no offline support, no AI features; user data isolation via Better Auth  
**Scale/Scope**: Multi-user web app with per-user task isolation via authentication

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Analysis**: The feature spec for an authenticated web-based todo app is fundamentally at odds with the current project constitution, which mandates:
- Console-based interaction only (this feature requires Next.js web UI)
- In-memory data structures only (this feature requires persistent PostgreSQL)
- No external services/APIs (this feature integrates Better Auth + Neon)
- No networking/web frameworks (this feature is built on FastAPI + Next.js)

**Decision**: The constitution describes the previous feature (001-console-todo-app). The new feature (001-build-auth-todo) represents a **phase transition** to a distributed web architecture. The existing constitution is superseded by the requirements in the current spec.

**New Principles for 001-build-auth-todo**:
- Multi-tier architecture (separate frontend/backend)
- Persistent, user-scoped data storage
- Third-party authentication integration (Better Auth)
- REST-only transport (no real-time, offline, or AI)
- Security-first: per-user data isolation enforced at API layer

**Justification**: A console-based in-memory app cannot satisfy the feature's core requirement for persistent, user-scoped, authenticated tasks. The shift to a modern web stack (FastAPI + Next.js + PostgreSQL + Better Auth) is the minimal necessary complexity to deliver this feature reliably.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                  # FastAPI app initialization
│   ├── config.py                # Environment config, DB connection
│   ├── auth/
│   │   ├── __init__.py
│   │   └── dependencies.py      # Better Auth token validation
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py              # SQLModel Task definition
│   ├── api/
│   │   ├── __init__.py
│   │   └── tasks.py             # CRUD endpoints
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py              # Request/response schemas
│   └── db/
│       ├── __init__.py
│       └── session.py           # Neon PostgreSQL session management
└── tests/
    ├── unit/
    ├── integration/
    └── conftest.py

frontend/
├── app/
│   ├── layout.tsx               # Root layout with auth provider
│   ├── page.tsx                 # Dashboard (task list)
│   └── api/
│       └── auth/
│           └── [...nextauth].ts # Next Auth route handler
├── src/
│   ├── components/
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskItem.tsx
│   ├── services/
│   │   └── api.ts               # API client for backend
│   ├── hooks/
│   │   └── useTasks.ts          # Task management logic
│   └── types/
│       └── task.ts              # TypeScript types
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Web application with separated backend (FastAPI) and frontend (Next.js). Backend handles authentication validation, data persistence, and CRUD operations. Frontend provides responsive UI and manages auth state via Better Auth. This separation ensures security (server-side token validation), scalability, and clear separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
