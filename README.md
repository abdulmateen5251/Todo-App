# Todo Application 🎯

A modern, full-stack authenticated task management application with FastAPI backend and Next.js frontend.

![Status](https://img.shields.io/badge/status-beta-blue)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Node](https://img.shields.io/badge/node-20+-green)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - JWT-based auth with Better Auth (pending integration)
- ✅ **Task CRUD** - Create, read, update, delete operations
- ✅ **Task Completion** - Toggle status with visual feedback
- ✅ **Due Dates** - Set deadlines with overdue warnings
- ✅ **Smart Filtering** - View all, active, or completed tasks

### User Experience
- ✅ **Responsive Design** - Mobile-first with Tailwind CSS (360px+)
- ✅ **Toast Notifications** - Real-time feedback for all actions
- ✅ **Undo Delete** - 5-second window to restore tasks
- ✅ **Edit Modal** - Full-featured task editor
- ✅ **Conflict Detection** - Prevents overwriting concurrent edits
- ✅ **Offline Detection** - Network status banner
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Skeleton Loaders** - Smooth loading states

### Developer Features
- ✅ **Auto-Retry** - Exponential backoff (max 3 retries)
- ✅ **Request Logging** - All API calls logged
- ✅ **Security Headers** - X-Frame-Options, CSP, HSTS
- ✅ **API Documentation** - Auto-generated OpenAPI/Swagger
- ✅ **Type Safety** - Full TypeScript + Pydantic validation

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
| **Database** | PostgreSQL (Neon) | 15+ |
| **Auth** | Better Auth | 4.24.5 |
| **Testing** | pytest, Jest | Latest |

### Project Structure

```
├── backend/                 # FastAPI application
│   ├── src/
│   │   ├── api/            # REST endpoints
│   │   ├── models/         # SQLModel entities
│   │   ├── schemas/        # Pydantic validation
│   │   ├── db/             # Database session
│   │   ├── auth/           # Auth middleware
│   │   └── main.py         # App entry point
│   ├── tests/              # pytest tests
│   ├── alembic/            # Migrations
│   └── requirements.txt
├── frontend/               # Next.js application
│   ├── app/                # App Router pages
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
└── specs/                  # Specifications
    └── 001-build-auth-todo/
```

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

# Configure environment
cp .env.example .env
# Edit .env - add your DATABASE_URL

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

# Configure environment
cp .env.local.example .env.local
# Edit .env.local - set NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

✅ Frontend running at **http://localhost:3000**

## 📖 API Reference

### Base URL

```
http://localhost:8000/api
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
POST /api/{user_id}/tasks
Content-Type: application/json

{
  "description": "Buy groceries",
  "due_date": "2026-01-10T00:00:00Z"
}
```

**Response:** `201 Created`

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
```bash
npm run lint
npm run format
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host/db
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
