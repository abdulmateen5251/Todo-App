# Data Model: Task Management System with AI Agents

**Date**: January 26, 2026  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md) | [research.md](research.md)

## Purpose

This document defines all entities, relationships, validation rules, and state transitions for the task management system.

## Entity Definitions

### User

Represents an authenticated user of the task management system.

**Attributes**:
- `id` (int, PK): Unique identifier for the user
- `email` (string, unique, required): User's email address for authentication
- `hashed_password` (string, required): Bcrypt-hashed password (managed by Better Auth)
- `created_at` (datetime, required): Account creation timestamp
- `updated_at` (datetime, required): Last account modification timestamp

**Relationships**:
- One-to-many with Task (one user owns many tasks)
- One-to-many with ConversationMessage (one user has many messages)

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Password must be at least 8 characters (enforced by Better Auth)
- Email must be unique across all users

**SQLModel Implementation**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### Task

Represents a single task item that users create, manage, and complete.

**Attributes**:
- `id` (int, PK): Unique identifier for the task
- `user_id` (int, FK → User.id, required): Owner of the task
- `title` (string, required): Brief description of the task
- `description` (string, optional): Detailed information about the task
- `status` (enum, required): Current state—either "pending" or "completed"
- `priority` (enum, optional): Importance level—"low", "medium", or "high"
- `category` (string, optional): User-defined grouping (e.g., "work", "personal")
- `due_date` (datetime, optional): When the task should be completed
- `completed_at` (datetime, optional): Timestamp when status changed to "completed"
- `created_at` (datetime, required): Task creation timestamp
- `updated_at` (datetime, required): Last modification timestamp

**Relationships**:
- Many-to-one with User (many tasks belong to one user)

**Validation Rules**:
- Title must not be empty and max 500 characters
- Status must be either "pending" or "completed"
- Priority, if provided, must be "low", "medium", or "high"
- Due date, if provided, must be in the future for new tasks
- Description max 5000 characters
- Completed_at must be set when status changes to "completed"
- User_id must reference an existing user

**State Transitions**:
```
[New Task]
    ↓
status = "pending"
    ↓
(User completes task)
    ↓
status = "completed"
completed_at = now()
```

Once completed, tasks can be updated or deleted but status cannot revert to "pending" (one-way transition).

**SQLModel Implementation**:
```python
from sqlmodel import SQLModel, Field, Enum as SQLEnum
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=500)
    description: str | None = Field(default=None, max_length=5000)
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    priority: TaskPriority | None = Field(default=None)
    category: str | None = Field(default=None, max_length=100)
    due_date: datetime | None = Field(default=None)
    completed_at: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### ConversationMessage

Represents a single message in the conversation between user and AI agent. Stores both user inputs and assistant responses to enable stateless request processing.

**Attributes**:
- `id` (int, PK): Unique identifier for the message
- `user_id` (int, FK → User.id, required): User who owns this conversation
- `role` (enum, required): Speaker—either "user" or "assistant"
- `content` (text, required): The message text
- `tool_calls` (JSON string, optional): Record of MCP tools invoked (for assistant messages only)
- `tool_results` (JSON string, optional): Outputs from tool invocations
- `created_at` (datetime, required): Message timestamp

**Relationships**:
- Many-to-one with User (many messages belong to one user)

**Validation Rules**:
- Role must be "user" or "assistant"
- Content must not be empty
- Tool_calls only populated for role="assistant"
- User_id must reference an existing user
- Messages ordered by created_at for conversation reconstruction

**Purpose**:
This entity enables the stateless backend architecture. On each request:
1. Fetch all messages for user_id ordered by created_at
2. Build conversation context array
3. Send to OpenAI Agents SDK
4. Store new user message and assistant response

**SQLModel Implementation**:
```python
from sqlmodel import SQLModel, Field
from datetime import datetime

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ConversationMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: MessageRole
    content: str = Field(max_length=10000)
    tool_calls: str | None = Field(default=None)  # JSON string
    tool_results: str | None = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
```

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ created_at  │
│ updated_at  │
└──────┬──────┘
       │
       │ 1:N
       │
   ┌───┴────────────────────────────┐
   │                                │
   ▼                                ▼
┌──────────────┐          ┌───────────────────────┐
│     Task     │          │ ConversationMessage   │
├──────────────┤          ├───────────────────────┤
│ id (PK)      │          │ id (PK)               │
│ user_id (FK) │          │ user_id (FK)          │
│ title        │          │ role                  │
│ description  │          │ content               │
│ status       │          │ tool_calls            │
│ priority     │          │ tool_results          │
│ category     │          │ created_at            │
│ due_date     │          └───────────────────────┘
│ completed_at │
│ created_at   │
│ updated_at   │
└──────────────┘
```

## Indexes

For optimal query performance:

**User table**:
- Primary key index on `id` (automatic)
- Unique index on `email` (for authentication lookups)

**Task table**:
- Primary key index on `id` (automatic)
- Index on `user_id` (for filtering user's tasks)
- Composite index on `(user_id, status)` (for filtering by completion status)
- Index on `due_date` (for date-based queries)

**ConversationMessage table**:
- Primary key index on `id` (automatic)
- Composite index on `(user_id, created_at)` (for fetching conversation history chronologically)

## Database Constraints

1. **Foreign Key Constraints**:
   - `Task.user_id` → `User.id` (ON DELETE CASCADE)
   - `ConversationMessage.user_id` → `User.id` (ON DELETE CASCADE)

2. **Check Constraints**:
   - `Task.title` must not be empty string
   - `Task.status` must be in ["pending", "completed"]
   - `Task.priority` if not null must be in ["low", "medium", "high"]
   - `ConversationMessage.role` must be in ["user", "assistant"]

3. **Unique Constraints**:
   - `User.email` must be unique

## Data Lifecycle

### Task Lifecycle

1. **Creation**: 
   - User sends natural language request
   - AI agent invokes `add_task` MCP tool
   - Task created with status="pending", created_at=now(), updated_at=now()

2. **Updates**:
   - User requests modifications via conversation
   - AI agent invokes `update_task` MCP tool with changed fields
   - Updated_at timestamp refreshed

3. **Completion**:
   - User indicates task is done
   - AI agent invokes `complete_task` MCP tool
   - Status → "completed", completed_at=now(), updated_at=now()

4. **Deletion**:
   - User requests removal
   - AI agent invokes `delete_task` MCP tool
   - Task record permanently removed from database

### Conversation Lifecycle

1. **Message Creation**:
   - User sends message → stored as role="user"
   - AI responds → stored as role="assistant" with tool_calls/results if applicable

2. **Retention**:
   - All messages retained indefinitely for conversation continuity
   - Future enhancement: implement message pruning after N days or M messages

3. **Context Reconstruction**:
   - On each request, fetch last 50 messages for user_id
   - Build conversation array in chronological order
   - Append new user message
   - Send to OpenAI Agents SDK

## Migration Strategy

Database migrations managed via Alembic:

**Initial migration** creates:
- `user` table
- `task` table
- `conversationmessage` table
- All indexes and constraints

**Future migrations** will:
- Add new optional fields (e.g., task tags, reminders)
- Create indexes for performance optimization
- Never drop columns (only deprecate with nullable constraint)

## Sample Data

### User
```json
{
  "id": 1,
  "email": "alice@example.com",
  "hashed_password": "$2b$12$abcdef...",
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T10:00:00Z"
}
```

### Task
```json
{
  "id": 42,
  "user_id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and coffee beans",
  "status": "pending",
  "priority": "medium",
  "category": "personal",
  "due_date": "2026-01-27T18:00:00Z",
  "completed_at": null,
  "created_at": "2026-01-26T10:15:00Z",
  "updated_at": "2026-01-26T10:15:00Z"
}
```

### ConversationMessage
```json
[
  {
    "id": 101,
    "user_id": 1,
    "role": "user",
    "content": "Create a task to buy groceries",
    "tool_calls": null,
    "tool_results": null,
    "created_at": "2026-01-26T10:15:00Z"
  },
  {
    "id": 102,
    "user_id": 1,
    "role": "assistant",
    "content": "I've created a task for 'Buy groceries'. Would you like to add a due date or priority?",
    "tool_calls": "[{\"name\": \"add_task\", \"arguments\": {\"title\": \"Buy groceries\"}}]",
    "tool_results": "[{\"success\": true, \"task_id\": 42}]",
    "created_at": "2026-01-26T10:15:01Z"
  }
]
```
