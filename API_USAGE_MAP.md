# Backend API Usage - Quick Reference

## ✅ 3 Servers Running on Docker

| Server | Type | URL | Port | Status |
|--------|------|-----|------|--------|
| **todo-frontend** | Next.js | http://localhost:3000 | 3000 | 🟢 Running |
| **todo-backend** | FastAPI | http://localhost:8000 | 8000 | 🟢 Running |
| **todo-postgres** | PostgreSQL | localhost | 5432 | 🟢 Running |

---

## 🤖 AI Usage in Backend

**Currently: ❌ NO AI is being used**

The backend uses:
- ✅ **FastAPI** - Web framework
- ✅ **SQLModel** - Database ORM
- ✅ **Pydantic** - Data validation
- ✅ **PostgreSQL** - Database

No AI/ML models, LLMs, or machine learning is integrated yet.

---

## 🎯 API Endpoints Used

### User Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/register` | POST | Sign up user |
| `/api/users/login` | POST | Sign in user |

### Task Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/{userId}/tasks` | GET | Load all tasks |
| `/api/{userId}/tasks` | POST | Create task |
| `/api/{userId}/tasks/{id}` | PUT | Update task |
| `/api/{userId}/tasks/{id}` | DELETE | Delete task |
| `/api/{userId}/tasks/{id}/complete` | PATCH | Toggle completion |

---

## 📍 Where Used

| Feature | Frontend File | Backend Endpoint |
|---------|---------------|------------------|
| **Sign Up** | `app/auth/signup/page.tsx` | `POST /api/users/register` |
| **Sign In** | `lib/auth.ts` | `POST /api/users/login` |
| **Load Tasks** | `hooks/useTasks.ts` | `GET /api/{userId}/tasks` |
| **Create Task** | `services/api.ts` | `POST /api/{userId}/tasks` |
| **Edit Task** | `services/api.ts` | `PUT /api/{userId}/tasks/{id}` |
| **Delete Task** | `services/api.ts` | `DELETE /api/{userId}/tasks/{id}` |
| **Toggle Task** | `services/api.ts` | `PATCH /api/{userId}/tasks/{id}/complete` |

---

## 🗄️ Database

**PostgreSQL** stores:
- **Users:** ID, email, name, created_at
- **Tasks:** ID, user_id, description, completed, due_date, created_at

---

## 🐳 Services Running

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:8000 | 8000 |
| Database | localhost | 5432 |

**View API Docs:** http://localhost:8000/docs
