# Todo Application 🎯

A modern, full-stack AI-powered task management application with conversational interface, real-time sync, and dual AI provider support.

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Node](https://img.shields.io/badge/node-20+-green)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Key Highlights

- 🤖 **AI-Powered Chat Interface** - Manage tasks using natural language with GPT-4o-mini or Gemini
- ⚡ **Real-time Sync** - Instant updates between chat and dashboard (no page refresh needed)
- 🔄 **Dual AI Support** - Switch between OpenAI and Google Gemini with a single config change
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🔒 **Enterprise Security** - JWT auth, API key protection, and comprehensive security features

## ✨ Features

### 🤖 AI & Conversational Interface
- ✅ **Natural Language Task Creation** - "Create a task to buy groceries tomorrow with high priority"
- ✅ **Smart Task Management** - List, update, complete, and delete tasks through conversation
- ✅ **MCP Tool Integration** - 5+ specialized tools for task operations
- ✅ **Conversation History** - Persistent chat context for better understanding
- ✅ **Dual AI Providers** - Choose between OpenAI (gpt-4o-mini) or Google Gemini (FREE)

### Core Functionality
- ✅ **User Authentication** - Secure JWT-based authentication with NextAuth
- ✅ **Task CRUD** - Create, read, update, delete with comprehensive validation
- ✅ **Task Properties** - Title, description, priority (low/medium/high), category, due dates
- ✅ **Task Completion** - Toggle status with visual feedback
- ✅ **Smart Filtering** - View all, active, or completed tasks
- ✅ **Real-time Dashboard Sync** - Chat and dashboard auto-sync without refresh

### User Experience
- ✅ **Responsive Design** - Mobile-first with Tailwind CSS (360px+)
- ✅ **Toast Notifications** - Real-time feedback for all actions
- ✅ **Undo Delete** - 5-second window to restore tasks
- ✅ **Edit Modal** - Full-featured task editor with live preview
- ✅ **Conflict Detection** - Prevents overwriting concurrent edits
- ✅ **Offline Detection** - Network status banner
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Skeleton Loaders** - Smooth loading states
- ✅ **Live Refresh Indicator** - Visual feedback when tasks sync
- ✅ **Chat State Persistence** - Messages saved across navigation

### Developer Features
- ✅ **Auto-Retry** - Exponential backoff (max 3 retries)
- ✅ **Request Logging** - All API calls logged with detailed info
- ✅ **Security Headers** - X-Frame-Options, CSP, HSTS
- ✅ **API Documentation** - Auto-generated OpenAPI/Swagger
- ✅ **Type Safety** - Full TypeScript + Pydantic validation
- ✅ **Event Bus System** - Component communication without prop drilling
- ✅ **Context API** - Clean state management with React Context
- ✅ **Environment-based AI** - Easy switching between AI providers
- ✅ **Security Audit Tools** - Automated API key leak detection

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 14.0.4 |
| | React | 18.2.0 |
| | TypeScript | 5.3.3 |
| | Tailwind CSS | 3.3.6 |
| **Backend** | FastAPI | 0.104.1 |
| | Python | 3.11+ |
| | SQLModel | 0.0.14 |
| **Database** | PostgreSQL | 15+ |
| **AI** | OpenAI (gpt-4o-mini) | Latest |
| | Google Gemini (flash-exp) | Latest |
| **Auth** | NextAuth.js | Latest |
| **Testing** | pytest, Jest | Latest |

### Project Structure

```
├── backend/                 # FastAPI appli (tasks, auth, chat)
│   │   ├── models/         # SQLModel entities (Task, User, Conversation)
│   │   ├── schemas/        # Pydantic validation
│   │   ├── db/             # Database session
│   │   ├── auth/           # Auth middleware & JWT
│   │   ├── services/       # Business logic (task, conversation)
│   │   ├── mcp_tools/      # AI function tools (add, list, update, etc.)
│   │   ├── agent.py        # AI client configuration
│   │   └── main.py         # App entry point
│   ├── tests/              # pytest tests
│   ├── alembic/            # Database migrations
│   └── requirements.txt
├── frontend/               # Next.js application
│   ├── app/                # App Router pages (dashboard, chat, auth)
│   ├── src/
│   │   ├── components/     # React components (Chat, Dashboard, TaskList)
│   │   ├── contexts/       # React Context (ChatContext)
│   │   ├── hooks/          # Custom hooks (useTasks, useToast)
│   │   ├── services/       # API clients (api, chatApi, authService)
│   │   ├── lib/            # Utilities (eventBus)
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
└── specs/                  # Specifications & Documentation
    ├── 001-task-mgmt-system/
    ├── AI_MODEL_SETUP.md
    ├── SECURITY_GUIDE.md
    └── TEST_REALTIME_SYNC.md
└── specs/                  # Specifications
    └── 001-build-auth-todo/
```database ([Local](https://postgresql.org) or [Neon](https://neon.tech))
- **AI API Key** - Choose one:
  - [OpenAI API Key](https://platform.openai.com/api-keys) (Paid, ~$0.001/chat)
  - [Google Gemini API Key](https://aistudio.google.com/app/apikey) (FREE

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org))
- **Python** 3.11+ ([Download](https://python.org))
- **PostgreSQL** or **Neon** account ([Sign up](https://neon.tech))

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/todo-app.git
cd todo-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt
with your settings:
#   - DATABASE_URL (PostgreSQL connection)
#   - OPENAI_GEMINI_MODE (true=OpenAI, false=Gemini)
#   - OPENAI_API_KEY or GEMINI_API_KEY
#   - JWT_SECRET

# Run migrations
alembic upgrade head

# Test configuration (optional)
python3 test_ai_config.pyur DATABASE_URL

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload
```

✅ Backend running at **http://localhost:8000**  
📚 API docs at **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# C🤖 AI Configuration

The app supports two AI providers. Choose based on your needs:

### Option 1: Google Gemini (FREE) - Recommended for Development

```env
OPENAI_GEMINI_MODE=false
GEMINI_API_KEY=your-gemini-api-key-here
```

- ✅ **Completely FREE** (15 req/min, 1M tokens/day)
- ✅ Get key: https://aistudio.google.com/app/apikey
- ✅ Uses `gemini-2.0-flash-exp` model

### Option 2: OpenAI (Paid) - Recommended for Production

```env
OPENAI_GEMINI_MODE=true
OPENAI_API_KEY=sk-proj-your-openai-key-here
```

- 💰 **Paid** (~$0.001 per chat message)
- ✅ Get key: https://platform.openai.com/api-keys
- ✅ Uses `gpt-4o-mini` model
- ⭐ More reliable function calling

### Switch Models Anytime

1. Edit `.env` file
2. Change `OPENAI_GEMINI_MODE` value
3. Update corresponding API key
4. Restart backend

See [AI_MODEL_SETUP.md](AI_MODEL_SETUP.md) for detailed guide.

## 📖 API Refer1,
    "title": "Buy groceries",
    "description": "Get milk, eggs, and bread",
    "priority": "high",
    "category": "personal",
    "completed": false,
    "status": "pending"

```
http://localhost:8000
```

### Authentication

All endpoints require JWT token:
```http
Authorization: Bearer <your-jwt-token>
```

Get token via `/api/auth/login` endpoint.

Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Get milk, eggs, and bread",
  "priority": "high",
  "category": "personal
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response includes JWT token for authenticated requests.

#### 💬 Chat (AI-Powered Task Management)

```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Create a task to buy groceries tomorrow with high priority"
}
```

**Response:**
```json
{
  "message": "✓ Created task 'Buy groceries' for tomorrow with high priority.",
  "tool_calls": [
    {
      "id": "call_abc123",
      "name": "add_task",
      "arguments": {
        "title": "Buy groceries",
        "priority": "high",
        "due_date": "2026-01-29"
      }
    }
  ]
}
```ost:8000/api
```

### Authentication

All endpoints require JWT token:
```http
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 📋 List Tasks

```http
GET /api/{user_id}/tasks
```

**Query Parameters:**
- `completed` (boolean) - Filter by status
- `limit` (integer, 1-1000) - Max results (default: 100)
- `offset` (integer) - Pagination offset

**Response:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-uuid",
    "description": "Buy groceries",
    "completed": false,
    "due_date": "2026-01-10T00:00:00Z",
    "created_at": "2026-01-07T10:00:00Z",
    "updated_at": "2026-01-07T10:00:00Z"
  }
]
```

#### ➕ Create Task

```http
POST**JWT Authentication** - Secure token-based auth
- ✅ **API Key Protection** - Never committed to git (.env in .gitignore)
- ✅ **User Data Isolation** - Users can only access their own tasks
- ✅ **CORS Configuration** - Proper origin restrictions
- ✅ **Security Headers** - X-Frame-Options, CSP, HSTS, XSS protection
- ✅ **Input Validation** - Comprehensive Pydantic schemas
- ✅ **SQL Injection Prevention** - SQLModel ORM protection
- ✅ **Request/Response Logging** - Full audit trail
- ✅ **API Key Validation** - Prevents invalid keys from being used
- ✅ **Security Audit Tools** - Automated leak detection (`security-check.sh`)

### Security Best Practices

Run security audit anytime:
```bash
bash security-check.sh
```

This checks:
- ✅ `.env` is in `.gitignore`
- ✅ `.env` not tracked by git
- ✅ No hardcoded secrets in code
- ✅ Template files exist

See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for complete security documentation.
#### ✏️ Update Task

```http
PUT /api/{user_id}/tasks/{task_id}
Content-Type: application/json

{
  "description": "Buy groceries and cook dinner",
  "due_date": "2026-01-11T00:00:00Z"
}
```

**Response:** `200 OK`

#### ✅ Toggle Completion

```http
PATCH /api/{user_id}/tasks/{task_id}/complete
```

**Response:** `200 OK` (completion status toggled)

#### 🗑️ Delete Task

```http
DELETE /api/{user_id}/tasks/{task_id}
```

**Response:** `204 No Content`

### Error Responses

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task description cannot be empty"
  },
  "status": 400
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# With coverage
pytest --cov=src --cov-report=html

# Specific test file
pytest tests/unit/test_task_model.py -v

# Integration tests
pytest tests/integration/ -v
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

## 🔒 Security

### Implemented
- ✅ JWT token validation
- ✅ User data isolation (user_id verification)
- ✅ CORS configuration
- ✅ Security headers (X-Frame-Options, CSP, HSTS, XSS)
- ✅ Input validation (Pydantic schemas)
- ✅ SQL injection prevention (SQLModel ORM)
- ✅ Request/response logging

### Pending
- ⚠️ Rate limiting (TODO)
- ⚠️ Better Auth integration (placeholder implemented)

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
railway up
```

**Database (Neon):**
- Create project at https://neon.tech
- Copy connection string to `DATABASE_URL`

## 🛠️ Development

### Code Style

**Backend:**
```bash
black src/
ruff check src/
```

**Frontend:**
# AI Configuration
OPENAI_GEMINI_MODE=false                    # true=OpenAI, false=Gemini
OPENAI_API_KEY=sk-proj-your-key-here       # If using OpenAI
GEMINI_API_KEY=your-key-here                # If using Gemini

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/todo_dev

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Environment
ENVIRONMENT=development
DEV_MODE=true
DEStatus:** ✅ **Production Ready**

### Completed Features
- ✅ **Phase 1-5:** Core task management system
- ✅ **AI Integration:** Dual provider support (OpenAI/Gemini)
- ✅ **Real-time Sync:** Event-based communication
- ✅ **Chat Interface:** Natural language task management
- ✅ **Security:** Comprehensive protection & audit tools
- ✅ **Authentication:** JWT + NextAuth integration
- ✅ **MCP Tools:** 5 specialized AI functions
- ✅ **Documentation:** Complete guides and API docs

### What's New (Latest Updates)
- 🆕 **AI Model Switching** - Toggle between OpenAI and Gemini
- 🆕 **Real-time Dashboard Sync** - No page refresh needed
- 🆕 **Chat State Persistence** - Messages saved across navigation
- 🆕 **Event Bus System** - Clean component communication
- 🆕 **Security Audit Tools** - Automated leak detection
- 🆕 **Comprehensive Documentation** - Setup guides for all features

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```📚 Documentation

- 📖 [AI Model Setup Guide](AI_MODEL_SETUP.md) - Configure OpenAI or Gemini
- 🔒 [Security Guide](SECURITY_GUIDE.md) - API key protection & best practices
- 🧪 [Real-time Sync Testing](TEST_REALTIME_SYNC.md) - Test event bus system
- 📋 [API Endpoints](API_ENDPOINTS.md) - Complete API reference
- 🤖 [MCP Tools Documentation](specs/001-task-mgmt-system/contracts/mcp-tools.md)
- 🎯 [Full Specification](specs/001-task-mgmt-system/)
**OpenAI** - GPT-4o-mini model
- **Google AI** - Gemini 2.0 Flash model (FREE tier!)
- **FastAPI** - Amazing Python web framework
- **Next.js** - React framework with App Router
- **PostgreSQL** - Robust database system
- **Tailwind CSS** - Utility-first styling
- **Vercel** - Frontend deployment platform
- **Hugging Face** - Backend deployment & hosting

---

**Built with ❤️ using FastAPI, Next.js, and AI**

## 🎯 Quick Links

| Resource | Link |
|----------|------|
| 🚀 Live Demo | Coming Soon |
| 📖 Full Docs | [./specs/](./specs/) |
| 🤖 AI Setup | [AI_MODEL_SETUP.md](AI_MODEL_SETUP.md) |
| 🔒 Security | [SECURITY_GUIDE.md](SECURITY_GUIDE.md) |
| 🧪 Tests | [TEST_REALTIME_SYNC.md](TEST_REALTIME_SYNC.md) |
| 🐛 Issues | [GitHub Issues](https://github.com/abdulmateen5251/Todo-App/issues) |

---

⭐ **Star this repo if you find it helpful!** ⭐
BETTER_AUTH_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/auth
```

## 📊 Project Status

**Phase Completion:** 58/79 tasks (73%)

- ✅ Phase 1: Setup
- ✅ Phase 2: Foundational Infrastructure
- ✅ Phase 3: User Story 1 (Secure Personal Workspace)
- ✅ Phase 4: User Story 2 (Task Lifecycle Management)
- ✅ Phase 5: User Story 3 (Responsive, Resilient Experience)
- 🚧 Phase 6: Polish & Deployment (in progress)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](./specs/001-build-auth-todo/)
- 🐛 [Issue Tracker](https://github.com/yourusername/todo-app/issues)
- 💬 [Discussions](https://github.com/yourusername/todo-app/discussions)

## 🙏 Acknowledgments

- FastAPI for the amazing Python framework
- Next.js team for the React framework
- Neon for serverless PostgreSQL
- Tailwind CSS for utility-first styling

---

**Built with ❤️ using FastAPI and Next.js**
