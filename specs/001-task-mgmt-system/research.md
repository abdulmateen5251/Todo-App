# Research: Task Management System with AI Agents

**Date**: January 26, 2026  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Purpose

This document resolves all technical unknowns and establishes best practices for implementing a stateless, conversational task management system using OpenAI Agents SDK, MCP tools, and database-backed state.

## Research Questions & Findings

### 1. OpenAI Agents SDK Integration

**Question**: How do we integrate OpenAI Agents SDK with FastAPI to process conversational task management requests?

**Decision**: Use the `openai` Python SDK's Assistants API (Agents SDK) with streaming support

**Rationale**:
- OpenAI Agents SDK provides built-in support for function calling (MCP tools)
- Streaming responses enable real-time conversational feedback
- Thread management can be offloaded to OpenAI's servers OR managed in our database
- FastAPI's async support aligns with OpenAI SDK's async client

**Alternatives considered**:
- Custom LLM integration (rejected: requires extensive prompt engineering and lacks tool-calling standardization)
- LangChain agents (rejected: adds unnecessary abstraction layer when OpenAI SDK natively supports our use case)

**Implementation approach**:
```python
from openai import AsyncOpenAI
from fastapi import FastAPI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def process_message(user_id: str, message: str):
    # Fetch conversation history from database
    history = await get_conversation_history(user_id)
    
    # Build messages array
    messages = history + [{"role": "user", "content": message}]
    
    # Create assistant run with tools
    response = await client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=messages,
        tools=[...],  # MCP tools as OpenAI function definitions
    )
    
    # Store assistant response in database
    await save_message(user_id, response)
    
    return response
```

---

### 2. MCP Tools with OpenAI Agents

**Question**: How do we expose MCP tools to the OpenAI Agent SDK for task operations?

**Decision**: Implement MCP tools as Python functions and map them to OpenAI function calling schema

**Rationale**:
- OpenAI Agents SDK supports function calling via JSON schema definitions
- MCP tools can be implemented as standard Python functions
- Each tool corresponds to one task operation (create, read, update, complete, delete)
- Tool definitions enforce strict parameter validation

**Alternatives considered**:
- Official MCP SDK Python server (rejected: adds unnecessary complexity when OpenAI SDK already supports function calling)
- Custom protocol (rejected: reinvents existing standards)

**Implementation approach**:
```python
# mcp_tools/add_task.py
async def add_task(user_id: str, title: str, description: str = None, 
                   due_date: str = None, priority: str = None) -> dict:
    """Create a new task for the user"""
    task = await task_service.create_task(
        user_id=user_id,
        title=title,
        description=description,
        due_date=due_date,
        priority=priority
    )
    return {"success": True, "task_id": task.id, "title": task.title}

# Convert to OpenAI function definition
TOOL_ADD_TASK = {
    "type": "function",
    "function": {
        "name": "add_task",
        "description": "Create a new task for the user",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Task title (required)"},
                "description": {"type": "string", "description": "Optional task details"},
                "due_date": {"type": "string", "description": "Optional due date (ISO 8601)"},
                "priority": {"type": "string", "enum": ["low", "medium", "high"]}
            },
            "required": ["title"]
        }
    }
}
```

---

### 3. Stateless Backend Architecture

**Question**: How do we maintain conversation context in a stateless backend without in-memory state?

**Decision**: Store all conversation history in PostgreSQL and rebuild context on each request

**Rationale**:
- Stateless design enables horizontal scaling (any server can handle any request)
- Database persistence survives server restarts/crashes
- Conversation threads can be retrieved using user_id as the key
- OpenAI SDK doesn't require server-side session management

**Alternatives considered**:
- OpenAI-managed threads (rejected: ties us to OpenAI's infrastructure and reduces control)
- Redis cache (rejected: still requires state management and adds complexity)
- Client-side conversation storage (rejected: security risk and doesn't support server-side filtering)

**Implementation approach**:
```python
# models/conversation.py
class ConversationMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    role: str  # "user" or "assistant"
    content: str
    tool_calls: str | None = None  # JSON string of tool invocations
    created_at: datetime = Field(default_factory=datetime.utcnow)

# services/conversation_service.py
async def get_conversation_history(user_id: int, limit: int = 50):
    """Fetch most recent N messages for building context"""
    messages = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.user_id == user_id)
        .order_by(ConversationMessage.created_at.desc())
        .limit(limit)
    )
    return [{"role": m.role, "content": m.content} for m in reversed(messages)]
```

---

### 4. Better Auth Integration

**Question**: How do we integrate Better Auth for user authentication in a FastAPI backend?

**Decision**: Use Better Auth's REST API mode with JWT token validation in FastAPI middleware

**Rationale**:
- Better Auth provides production-ready authentication (password hashing, session management, CSRF protection)
- JWT tokens enable stateless authentication (token contains user identity)
- FastAPI dependencies can extract user_id from validated tokens
- Supports social auth providers if needed in future

**Alternatives considered**:
- Custom JWT auth (rejected: requires implementing security best practices that Better Auth already provides)
- OAuth 2.0 with external provider only (rejected: forces users to have third-party accounts)
- FastAPI-Users (rejected: Better Auth specified in requirements)

**Implementation approach**:
```python
# api/auth.py
from fastapi import Depends, HTTPException, Header
import jwt

async def get_current_user(authorization: str = Header(...)) -> int:
    """Extract user_id from Better Auth JWT token"""
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# api/chat.py
@app.post("/api/chat")
async def chat_endpoint(
    message: str,
    user_id: int = Depends(get_current_user)
):
    # user_id is automatically extracted and validated
    response = await process_message(user_id, message)
    return response
```

---

### 5. Neon Serverless PostgreSQL

**Question**: What are best practices for using Neon PostgreSQL in a stateless FastAPI application?

**Decision**: Use SQLModel with async connection pooling and connection strings from environment variables

**Rationale**:
- Neon supports standard PostgreSQL clients (no special SDK required)
- SQLModel provides type-safe ORM with Pydantic integration
- Async connections prevent blocking FastAPI event loop
- Connection pooling minimizes latency for serverless cold starts

**Alternatives considered**:
- Raw SQL queries (rejected: type safety and validation lost)
- Synchronous SQLModel (rejected: blocks async FastAPI requests)
- Prisma (rejected: requires Node.js and TypeScript, not idiomatic for Python backend)

**Implementation approach**:
```python
# db/session.py
from sqlmodel import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries in development
    pool_size=5,
    max_overflow=10
)

async def get_session():
    async with AsyncSession(engine) as session:
        yield session
```

---

### 6. OpenAI ChatKit Integration

**Question**: How do we integrate OpenAI ChatKit in the React frontend for conversational UI?

**Decision**: Use ChatKit's React components with custom API backend integration

**Rationale**:
- ChatKit provides pre-built conversational UI components (message bubbles, input, typing indicators)
- Supports streaming responses for real-time feedback
- Customizable styling to match application branding
- Handles message rendering, scroll behavior, and accessibility

**Alternatives considered**:
- Custom chat UI (rejected: reinvents complex UX patterns like auto-scroll, message grouping, typing indicators)
- Vercel AI SDK Chat (rejected: ChatKit specified in requirements)
- Headless UI library (rejected: requires building all UI patterns from scratch)

**Implementation approach**:
```typescript
// components/ChatInterface.tsx
import { ChatProvider, ChatWindow } from '@openai/chatkit';

export function ChatInterface() {
  const sendMessage = async (message: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ message })
    });
    return response.json();
  };

  return (
    <ChatProvider onSendMessage={sendMessage}>
      <ChatWindow 
        placeholder="Tell me what you need to do..."
        welcomeMessage="Hi! I can help you manage your tasks. Try 'Create a task to buy groceries' or 'Show my tasks'."
      />
    </ChatProvider>
  );
}
```

---

### 7. Scope Enforcement & Security

**Question**: How do we ensure the AI agent only performs task-related operations and doesn't expose system internals?

**Decision**: Implement system prompt with explicit scope boundaries + tool-only mutations + user isolation in database queries

**Rationale**:
- System prompt instructs agent to decline out-of-scope requests
- All state changes go through validated MCP tools (no direct database access)
- Database queries filter by user_id to prevent cross-user access
- Tool schemas limit what data agents can read/write

**Alternatives considered**:
- Input validation only (rejected: doesn't prevent agent from attempting out-of-scope reasoning)
- Rate limiting (rejected: addresses different problem—doesn't enforce scope)
- Separate models for different operations (rejected: overcomplicated for this use case)

**Implementation approach**:
```python
# agent.py
SYSTEM_PROMPT = """You are a task management assistant. You can ONLY help users with:
- Creating tasks
- Viewing tasks
- Updating tasks
- Completing tasks
- Deleting tasks

You MUST decline all other requests politely and refocus on task management.
You MUST NOT mention system internals like MCP tools, database schemas, or APIs.
You MUST NOT access or modify data for users other than the current user.
"""

# mcp_tools/list_tasks.py
async def list_tasks(user_id: int, status: str = "all") -> list[dict]:
    """Retrieve tasks for the authenticated user only"""
    query = select(Task).where(Task.user_id == user_id)  # ← User isolation
    if status == "completed":
        query = query.where(Task.status == "completed")
    elif status == "pending":
        query = query.where(Task.status == "pending")
    
    tasks = await db.execute(query)
    return [task.model_dump() for task in tasks]
```

---

### 8. Error Handling & Resilience

**Question**: How do we handle failures in external services (OpenAI API, database) while maintaining user experience?

**Decision**: Implement graceful degradation with user-friendly error messages and retry logic

**Rationale**:
- OpenAI API failures should return immediate error (not queue/retry) to avoid user confusion
- Database failures should use exponential backoff with circuit breaker pattern
- All errors surfaced to users should be non-technical and actionable
- Logging captures technical details for debugging without exposing to users

**Alternatives considered**:
- Silent retries (rejected: users left waiting without feedback)
- Generic error messages (rejected: users can't distinguish between fixable and service-wide issues)
- Queue requests for async processing (rejected: breaks conversational flow)

**Implementation approach**:
```python
# api/chat.py
from fastapi import HTTPException
import httpx

@app.post("/api/chat")
async def chat_endpoint(message: str, user_id: int = Depends(get_current_user)):
    try:
        response = await process_message(user_id, message)
        return response
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=503,
            detail="The AI service is taking longer than usual. Please try again in a moment."
        )
    except openai.RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a moment before trying again."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong. Our team has been notified."
        )
```

---

## Summary of Decisions

| Area | Technology/Approach | Key Benefit |
|------|-------------------|-------------|
| AI Agent | OpenAI Agents SDK (Assistants API) | Native function calling support |
| MCP Tools | Python functions → OpenAI function schema | Type-safe, validated tool invocations |
| State Management | PostgreSQL-backed conversation history | Stateless backend, horizontal scaling |
| Authentication | Better Auth with JWT | Production-ready security |
| Database | Neon PostgreSQL + SQLModel async | Serverless compatibility |
| Frontend | OpenAI ChatKit (React) | Pre-built conversational UX |
| Scope Enforcement | System prompt + tool-only mutations + user isolation | Security and scope boundaries |
| Error Handling | Graceful degradation + user-friendly messages | Resilient user experience |

All technical unknowns have been resolved. Ready to proceed to Phase 1 (Data Model & Contracts).
