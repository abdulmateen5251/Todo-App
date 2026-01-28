# Implementation Plan: Task Management System with AI Agents

**Branch**: `001-task-mgmt-system` | **Date**: January 26, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-task-mgmt-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a conversational task management system where users interact via natural language through OpenAI ChatKit. The backend is a stateless FastAPI server that uses OpenAI Agents SDK for intent interpretation and MCP (Model Context Protocol) tools for all task operations. All state (tasks and conversation history) persists to Neon Serverless PostgreSQL. Users authenticate via Better Auth before accessing task operations. The system strictly enforces scope boundaries—only task management operations are permitted.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript/Node.js (frontend)  
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, Official MCP SDK (Python), SQLModel, Better Auth, OpenAI ChatKit (React)  
**Storage**: Neon Serverless PostgreSQL (tasks, users, conversation history)  
**Testing**: pytest (backend), Jest/React Testing Library (frontend)  
**Target Platform**: Linux server (backend), modern web browsers (frontend)
**Project Type**: Web application (separate frontend + backend)  
**Performance Goals**: <30s task creation latency, <2s task retrieval, 95% AI intent accuracy  
**Constraints**: Stateless backend (zero in-memory state), database as single source of truth, tool-only mutations  
**Scale/Scope**: Multi-user system, authenticated access, task CRUD operations only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Violations Analysis

This feature introduces **CRITICAL VIOLATIONS** to the existing constitution, which mandates:
- Console-first design (non-negotiable)
- In-memory Python data structures only
- No external dependencies beyond Python standard library
- No file I/O, no APIs, no databases, no networking

**Constitution vs. This Feature**:

| Constitution Requirement | This Feature's Approach | Violation Severity |
|-------------------------|------------------------|-------------------|
| Console CLI only | OpenAI ChatKit web interface | ❌ CRITICAL |
| In-memory storage | Neon PostgreSQL database | ❌ CRITICAL |
| No external dependencies | FastAPI, OpenAI SDK, MCP SDK, Better Auth | ❌ CRITICAL |
| No external calls | OpenAI API for agent reasoning | ❌ CRITICAL |
| Single-process | Multi-service architecture (frontend + backend) | ❌ CRITICAL |
| Standard Python only | TypeScript frontend, multiple SDKs | ❌ CRITICAL |

### Gate Evaluation

**GATE STATUS: ⚠️ CONSTITUTION MISMATCH DETECTED**

The current constitution (version 1.0.0) was written for an in-memory console-based todo application with zero external dependencies. This new feature specification requires a complete architectural pivot to:
- Web-based conversational UI
- External AI services
- Database persistence
- Multi-language stack
- Distributed architecture

### Resolution Required

**Option A (RECOMMENDED)**: Amend the constitution to reflect the new architectural direction. Create constitution v2.0.0 that establishes principles for:
- Stateless web services
- External AI integration
- Database-backed persistence
- Security and authentication
- Scope-bounded operations

**Option B**: Reject this feature specification and design a console-based conversational todo system that aligns with the existing constitution (in-memory, no external APIs, single Python process).

**Option C**: Maintain two constitutions: one for legacy console apps, one for modern web services.

**⚠️ PLANNING CANNOT PROCEED WITHOUT RESOLUTION**

The constitution serves as the ultimate authority for all development decisions. This feature fundamentally conflicts with every core principle in the current constitution. We must either update the governing document or reject the feature.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-mgmt-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # REST API contract for task operations
│   ├── mcp-tools.json   # MCP tool definitions
│   └── conversation-flow.md  # Conversation state machine
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py                  # FastAPI application entry point
│   ├── mcp_server.py            # MCP server initialization and tool definitions
│   ├── agent.py                 # OpenAI Agents SDK integration
│   ├── models/
│   │   ├── task.py              # SQLModel: Task entity
│   │   ├── user.py              # SQLModel: User entity (Better Auth integration)
│   │   └── conversation.py      # SQLModel: Conversation history
│   ├── services/
│   │   ├── task_service.py      # Business logic: CRUD operations
│   │   └── conversation_service.py  # Fetch/store conversation history
│   ├── mcp_tools/
│   │   ├── __init__.py
│   │   ├── add_task.py          # MCP tool: create new task
│   │   ├── list_tasks.py        # MCP tool: retrieve tasks with filters
│   │   ├── update_task.py       # MCP tool: modify task properties
│   │   ├── complete_task.py     # MCP tool: mark task complete
│   │   └── delete_task.py       # MCP tool: remove task
│   ├── api/
│   │   ├── chat.py              # POST /api/chat endpoint
│   │   └── auth.py              # Better Auth integration routes
│   └── db/
│       ├── session.py           # Neon PostgreSQL connection
│       └── migrations/          # Alembic migrations
└── tests/
    ├── unit/
    │   ├── test_task_service.py
    │   ├── test_mcp_tools.py
    │   └── test_agent.py
    ├── integration/
    │   ├── test_chat_api.py
    │   └── test_stateless_behavior.py
    └── contract/
        └── test_mcp_contract.py

frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx    # OpenAI ChatKit integration
│   │   └── AuthGuard.tsx        # Better Auth session check
│   ├── pages/
│   │   ├── index.tsx            # Landing page
│   │   ├── chat.tsx             # Main conversational UI
│   │   └── login.tsx            # Better Auth login
│   ├── services/
│   │   ├── chatApi.ts           # API client for /api/chat
│   │   └── authService.ts       # Better Auth client
│   └── types/
│       ├── task.ts              # TypeScript types matching backend models
│       └── conversation.ts      # Message and conversation types
└── tests/
    ├── unit/
    │   └── components/
    └── integration/
        └── chat-flow.test.tsx
```

**Structure Decision**: Web application architecture with separate frontend and backend projects. This structure supports the stateless backend requirement by clearly separating client-side UI (ChatKit) from server-side processing (FastAPI + MCP + Agents SDK). The backend structure groups MCP tools in a dedicated directory to enforce tool-only mutation patterns. Conversation history storage in the database enables stateless request processing.

## Complexity Tracking

> **This section documents violations requiring justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| External AI service (OpenAI Agents SDK) | Natural language interpretation requires sophisticated language models beyond what can be implemented in-house | Building a custom NLP engine would require months of development, large training datasets, and ongoing maintenance—infeasible for this feature scope |
| Database persistence (Neon PostgreSQL) | Stateless backend architecture requires external storage to maintain conversation context across requests | In-memory storage violates the stateless requirement (state would be lost on server restart/scale) and limits horizontal scaling |
| Multi-service architecture (frontend + backend) | Web-based conversational UI (ChatKit) requires browser rendering, which cannot run in a console environment | Console-only interface eliminates the rich conversational UX provided by ChatKit and limits accessibility for non-technical users |
| MCP SDK dependency | Standardized protocol for AI-tool integration ensures compatibility with OpenAI Agents SDK and future agent frameworks | Custom tool protocol would create vendor lock-in and prevent interoperability with emerging AI agent standards |
| Better Auth dependency | Production-ready authentication system with session management, security best practices, and user isolation | Building custom auth introduces security risks (password storage, session management, CSRF protection) that are solved problems |

### Justification Summary

These violations are intentional departures from the console-based constitution to enable a **production-grade conversational AI task manager**. Each dependency solves a specific architectural requirement:
- **Stateless backend**: Requires database (not in-memory)
- **Natural language**: Requires AI service (not keyword matching)
- **Web accessibility**: Requires frontend framework (not console)
- **Security**: Requires auth framework (not manual implementation)
- **AI interoperability**: Requires MCP standard (not custom protocol)

If the constitution must be preserved, this feature cannot be implemented as specified. A simpler alternative would be a console-based keyword parser with in-memory tasks—but this fundamentally changes the product vision outlined in the specification.
