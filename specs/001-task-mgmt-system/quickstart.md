# Quickstart Guide: Task Management System

**Feature**: Task Management System with AI Agents  
**Status**: Planning Complete - Ready for Implementation  
**Documentation**: [spec.md](spec.md) | [plan.md](plan.md) | [research.md](research.md) | [data-model.md](data-model.md)

## Overview

This system provides a conversational task management interface where users interact via natural language through OpenAI ChatKit. The backend is a stateless FastAPI server using OpenAI Agents SDK for intent interpretation and MCP tools for all task operations.

**Key Characteristics**:
- **Stateless Backend**: Zero in-memory state; all data in PostgreSQL
- **Conversational UI**: Natural language task management via ChatKit
- **AI-Powered**: OpenAI Agents SDK interprets user intent
- **Tool-Based Mutations**: All state changes through MCP tools
- **Secure**: Better Auth for authentication, user isolation enforced

## Architecture at a Glance

```
┌─────────────────────┐
│   React Frontend    │  OpenAI ChatKit
│   (TypeScript)      │  Better Auth Client
└──────────┬──────────┘
           │
           │ HTTPS
           ▼
┌─────────────────────┐
│  FastAPI Backend    │  JWT Authentication
│  (Python 3.13+)     │  Stateless Processing
└──────────┬──────────┘
           │
           ├─────────────┐
           │             │
           ▼             ▼
┌──────────────┐  ┌─────────────────┐
│  OpenAI API  │  │  Neon Postgres  │
│  Agents SDK  │  │  (Tasks + Msgs) │
└──────────────┘  └─────────────────┘
```

## Prerequisites

### Development Environment
- Python 3.13+
- Node.js 18+
- PostgreSQL client (for migrations)
- Git

### External Services
- **Neon PostgreSQL**: Serverless database (sign up at neon.tech)
- **OpenAI API**: GPT-4 access (api.openai.com)
- **Better Auth**: Authentication service (better-auth.com or self-hosted)

### Environment Variables

Create `.env` files in `backend/` and `frontend/`:

**backend/.env**:
```bash
# Database
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/taskdb?sslmode=require

# OpenAI
OPENAI_API_KEY=sk-proj-xxx

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://your-auth-domain.com

# Application
FASTAPI_ENV=development
CORS_ORIGINS=http://localhost:3000
```

**frontend/.env.local**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-auth-domain.com
```

## Quick Setup

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3.13 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn src.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Project Structure

```
backend/
├── src/
│   ├── main.py                  # FastAPI app entry point
│   ├── agent.py                 # OpenAI Agents SDK integration
│   ├── models/                  # SQLModel entities (User, Task, ConversationMessage)
│   ├── services/                # Business logic (task CRUD, conversation history)
│   ├── mcp_tools/               # MCP tool implementations (add_task, list_tasks, etc.)
│   ├── api/                     # HTTP endpoints (/api/chat, /api/auth/*)
│   └── db/                      # Database session, migrations
├── tests/                       # Unit, integration, contract tests
└── requirements.txt             # Python dependencies

frontend/
├── src/
│   ├── components/              # React components (ChatInterface, AuthGuard)
│   ├── pages/                   # Next.js pages (index, chat, login)
│   ├── services/                # API clients (chatApi, authService)
│   └── types/                   # TypeScript type definitions
├── tests/                       # Frontend tests
└── package.json                 # Node dependencies
```

## Core Dependencies

### Backend (Python)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlmodel` - ORM with Pydantic integration
- `asyncpg` - Async PostgreSQL driver
- `openai` - OpenAI Agents SDK
- `python-jose` - JWT token handling
- `alembic` - Database migrations
- `pytest` - Testing framework

Install via:
```bash
pip install fastapi uvicorn sqlmodel asyncpg openai python-jose[cryptography] alembic pytest
```

### Frontend (TypeScript/React)
- `next` - React framework
- `@openai/chatkit` - Conversational UI components
- `axios` - HTTP client
- `better-auth` - Authentication client

Install via:
```bash
npm install next react react-dom @openai/chatkit axios better-auth
npm install -D typescript @types/react @types/node
```

## API Endpoints

### Chat Endpoint
```http
POST /api/chat
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "message": "Create a task to buy groceries"
}
```

**Response**:
```json
{
  "role": "assistant",
  "content": "I've created a task titled 'Buy groceries'. Would you like to add a due date?",
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {"title": "Buy groceries"}
    }
  ],
  "created_at": "2026-01-26T10:15:01Z"
}
```

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token

See [contracts/openapi.yaml](contracts/openapi.yaml) for full API specification.

## Database Schema

### Tables
1. **user**: Authenticated users (id, email, hashed_password, created_at, updated_at)
2. **task**: User tasks (id, user_id, title, description, status, priority, category, due_date, completed_at, created_at, updated_at)
3. **conversationmessage**: Chat history (id, user_id, role, content, tool_calls, tool_results, created_at)

### Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

See [data-model.md](data-model.md) for detailed schema documentation.

## MCP Tools

The system exposes 5 MCP tools to the AI agent:

1. **add_task**: Create new task
2. **list_tasks**: Retrieve tasks (filtered by status)
3. **update_task**: Modify task properties
4. **complete_task**: Mark task as done
5. **delete_task**: Remove task

See [contracts/mcp-tools.md](contracts/mcp-tools.md) for tool schemas and implementation details.

## Development Workflow

### 1. Make Changes
Edit files in `backend/src/` or `frontend/src/`

### 2. Test Locally
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### 3. Database Changes
```bash
# After modifying SQLModel schemas
cd backend
alembic revision --autogenerate -m "add new field"
alembic upgrade head
```

### 4. Run Full Stack
```bash
# Terminal 1: Backend
cd backend && uvicorn src.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Database (if running locally)
docker run -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres
```

## Testing the System

### Manual Testing via ChatKit UI

1. Navigate to `http://localhost:3000/chat`
2. Login with test account
3. Try these commands:
   - "Create a task to buy groceries"
   - "Show my tasks"
   - "Mark buy groceries as complete"
   - "Update the grocery task due date to tomorrow"
   - "Delete the grocery task"

### Automated Testing

```bash
# Backend unit tests
cd backend
pytest tests/unit/

# Backend integration tests
pytest tests/integration/

# Frontend tests
cd frontend
npm run test
```

## Troubleshooting

### OpenAI API Errors
**Problem**: `503 Service Unavailable` from `/api/chat`  
**Solution**: Check `OPENAI_API_KEY` is valid and has GPT-4 access

### Database Connection Failures
**Problem**: `connection refused` to PostgreSQL  
**Solution**: Verify `NEON_DATABASE_URL` is correct and Neon database is accessible

### Authentication Errors
**Problem**: `401 Unauthorized` on `/api/chat`  
**Solution**: Ensure JWT token is included in `Authorization: Bearer <token>` header

### Stateless Behavior Verification
**Problem**: Conversation context lost between requests  
**Solution**: Check `ConversationMessage` table is being populated and `get_conversation_history()` is fetching messages

## Next Steps

1. **Implement Phase 2 Tasks**: Run `/speckit.tasks` to break down implementation into actionable tasks
2. **Set Up CI/CD**: Configure GitHub Actions for automated testing and deployment
3. **Deploy to Production**: Deploy backend to a serverless platform (e.g., Vercel, Railway) and frontend to Vercel
4. **Monitor Performance**: Add observability (Sentry, Datadog) to track errors and latency
5. **User Testing**: Conduct usability testing with real users to refine conversational UX

## Additional Resources

- **Specification**: [spec.md](spec.md) - Full feature requirements
- **Planning**: [plan.md](plan.md) - Technical architecture and decisions
- **Research**: [research.md](research.md) - Technology choices and best practices
- **Data Model**: [data-model.md](data-model.md) - Database schema and entities
- **API Contract**: [contracts/openapi.yaml](contracts/openapi.yaml) - REST API specification
- **MCP Tools**: [contracts/mcp-tools.md](contracts/mcp-tools.md) - Tool definitions and usage
- **Conversation Flow**: [contracts/conversation-flow.md](contracts/conversation-flow.md) - Stateless processing pattern

## Support

For questions or issues during implementation:
1. Review the specification and planning documents
2. Check contract definitions for API/tool schemas
3. Verify environment variables are correctly configured
4. Test individual components in isolation
5. Consult OpenAI Agents SDK documentation: https://platform.openai.com/docs/assistants

---

**Ready to build!** This quickstart provides everything needed to get the development environment running and start implementing the task management system.
