# Data Model: Authenticated Web-Based Todo Application

**Phase**: 1 – Design & Contracts  
**Date**: 2026-01-07  
**Feature**: Authenticated Web-Based Todo Application (001-build-auth-todo)

---

## Overview

The data model defines the core entities for a multi-user task management system. All data is scoped to an authenticated user via Better Auth tokens. Persistence is handled by Neon Serverless PostgreSQL with SQLModel ORM.

---

## Entity: User

**Source**: Better Auth (external identity provider)

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| `user_id` | UUID / string | Primary identifier | Derived from Better Auth token claims |
| `email` | string | Unique, required | Provided by Better Auth |
| `name` | string | Optional | Provided by Better Auth |
| `created_at` | datetime | Auto-generated | Timestamp when user first signs in |

**Rationale**: User data is managed by Better Auth; the backend references `user_id` to scope task ownership.

---

## Entity: Task

**Storage**: PostgreSQL (Neon)

| Field | Type | Constraints | Notes |
|-------|------|-----------|-------|
| `id` | UUID | Primary key | Auto-generated, unique per database |
| `user_id` | UUID | Foreign key, required | Links task to user; combined (user_id, id) is unique |
| `description` | string | Max 200 chars, required | The task text |
| `completed` | boolean | Default false | Whether task is marked done |
| `due_date` | datetime | Optional | When task is due (nullable) |
| `created_at` | datetime | Auto-generated, required | When task was created |
| `updated_at` | datetime | Auto-updated | Last modification timestamp |

**Validation Rules**:
- `description` must not be empty and not exceed 200 characters.
- `completed` is a boolean (true/false); toggled via the `/complete` endpoint.
- `due_date` is optional; if provided, must be a valid ISO 8601 datetime.
- `user_id` must match the authenticated user's ID from the token (enforced at API layer).
- No task can be created, updated, or deleted by a user who does not own it.

**Indexes**:
- Primary key on `id`.
- Composite unique on `(user_id, id)` (implicit via primary key scoped to user).
- Index on `user_id` for fast lookups of all tasks by user.
- Index on `completed` for filtering completed/pending tasks.

**Relationships**:
- **User → Task**: One-to-many. One user owns many tasks. Enforced via `user_id` foreign key.

---

## Entity: TaskDisplayState (UI Concept)

**Storage**: Derived from Task entity at API response time

| Field | Type | Derivation | Notes |
|-------|------|-----------|-------|
| `id` | UUID | From Task.id | Task identifier |
| `description` | string | From Task.description | Task text |
| `completed` | boolean | From Task.completed | Completion status badge |
| `due_date` | datetime \| null | From Task.due_date | Due date or empty |
| `created_at` | datetime | From Task.created_at | Display "created X days ago" |
| `updated_at` | datetime | From Task.updated_at | "last edited X hours ago" |
| `is_editable` | boolean | Computed: true if user == owner | Show edit/delete controls |
| `status_badge` | string | Computed: "pending" \| "completed" | CSS class for styling |

**Rationale**: This entity does not exist in the database; it is computed by the API response layer. The frontend receives the full Task data and renders UI elements accordingly.

---

## State Transitions (Task Lifecycle)

```
[Created]
    ↓
[Pending] ←→ [Completed]   (via PATCH /tasks/{id}/complete)
    ↓
[Deleted]                   (via DELETE /tasks/{id})

OR

[Pending] → [Edited] → [Pending/Completed]   (via PUT /tasks/{id})
```

**Workflow**:
1. User creates a task: Task enters [Pending] state.
2. User can edit the task's description at any time.
3. User can toggle the completion flag, moving between [Pending] and [Completed].
4. User can delete the task; it is removed from the database (soft delete or hard delete per policy).
5. Once deleted, the task is no longer accessible to the user.

---

## Database Schema (PostgreSQL DDL)

```sql
-- Users table (populated by Better Auth; backend references only)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, id)  -- Enforce per-user isolation
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

---

## Access Control Rules (API Layer)

1. **Authentication Required**: Every endpoint requires a valid Better Auth token.
2. **User ID Matching**: The path parameter `{user_id}` must match the token's `user_id` claim.
   - If mismatch: return 403 Forbidden.
3. **Data Isolation**: A user can only read/write/delete tasks where `task.user_id == authenticated_user_id`.
   - If a user attempts to access another user's task: return 403 Forbidden.
4. **Token Validation**: Backend verifies the token's signature and expiry on every request.
   - If token is invalid or expired: return 401 Unauthorized.

---

## Design Decisions & Rationale

### Why UUID for IDs?
- **Universally unique**: Can be generated client-side or server-side without coordination.
- **Non-sequential**: Prevents enumeration attacks (e.g., guessing task IDs).
- **Scalable**: Suitable for distributed systems.

### Why 200 characters for description?
- **Reasonable limit**: Prevents abuse (e.g., gigabytes of text).
- **UI-friendly**: Fits in typical form fields and list views.
- **Spec-aligned**: Requirement FR-004 specifies a max length.

### Why soft delete vs. hard delete?
- **Current approach**: Hard delete (data is removed).
- **Alternative**: Soft delete (add `deleted_at` timestamp, exclude from queries).
- **Decision**: Hard delete for MVP simplicity; soft delete can be added if audit trails are needed.

### Why composite unique on (user_id, id)?
- **Implicit**: The task ID is unique within a user's namespace, not globally.
- **Prevents duplicates**: Two users cannot create tasks with the same ID.
- **Enforces scoping**: Database-level validation of the access control boundary.

### Why `updated_at` timestamp?
- **Auditability**: Track when tasks are last modified.
- **UI context**: Display "last edited X hours ago" to user.
- **Concurrency**: Optional foundation for optimistic locking (conflict detection).

---

## Migration Strategy

### Initial Setup
1. Run Alembic migration to create `users` and `tasks` tables.
2. Verify indexes are created for performance.

### Future Evolutions (Out of Scope for MVP)
- Add `assigned_to` field for task delegation.
- Add `priority` enum (low, medium, high) for sorting.
- Add `tags` many-to-many table for categorization.
- Soft delete with `deleted_at` timestamp for audit trails.
- Archival of completed tasks older than N days.

---

## Notes for Implementation

- **SQLModel Definition** (Python):
  ```python
  from sqlmodel import SQLModel, Field
  from datetime import datetime
  from uuid import uuid4

  class Task(SQLModel, table=True):
      id: UUID = Field(default_factory=uuid4, primary_key=True)
      user_id: UUID = Field(foreign_key="users.id")
      description: str = Field(max_length=200)
      completed: bool = Field(default=False)
      due_date: Optional[datetime] = None
      created_at: datetime = Field(default_factory=datetime.utcnow)
      updated_at: datetime = Field(default_factory=datetime.utcnow)
  ```

- **Request/Response Schemas** (Pydantic):
  ```python
  class TaskCreate(BaseModel):
      description: str  # max_length=200 validated by Pydantic

  class TaskUpdate(BaseModel):
      description: Optional[str] = None

  class TaskResponse(BaseModel):
      id: UUID
      description: str
      completed: bool
      due_date: Optional[datetime]
      created_at: datetime
      updated_at: datetime
  ```

---

## Summary

The data model is intentionally minimal for MVP delivery:
- **One user-scoped entity** (Task) with clear ownership via `user_id`.
- **Enforcement at two layers**: Database constraints + API validation.
- **Stateless design**: No sessions; all identity comes from Better Auth tokens.
- **Audit trail**: `created_at` and `updated_at` for visibility into task lifecycle.
- **Scalable foundation**: UUIDs, indexes, and per-user namespacing support future growth.

Next: API contracts and request/response specifications.
