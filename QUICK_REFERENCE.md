# 🚀 Quick Reference Card

**Authenticated Todo Application** | Status: ✅ 85% Complete | Date: Jan 7, 2026

---

## 🎯 One-Liner Setup

```bash
# Clone, start Docker stack, and access at localhost:3000
git clone <repo> && cd Todo-App && docker-compose up -d
```

---

## 📋 Common Commands

### Local Development (Docker)
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose logs -f frontend   # View frontend logs
docker-compose exec backend sh    # Backend shell
docker-compose exec postgres psql # Database shell
```

### Backend (Without Docker)
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head              # Run migrations
uvicorn src.main:app --reload     # Start dev server
pytest tests/ -v                  # Run tests
```

### Frontend (Without Docker)
```bash
cd frontend
npm install
npm run dev                       # Start dev server
npm run build                     # Production build
npm test                          # Run tests
npm run lint                      # Lint code
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js dashboard |
| **Backend** | http://localhost:8000 | FastAPI API |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **ReDoc** | http://localhost:8000/redoc | Alternative docs |
| **Health** | http://localhost:8000/health | Health check |

---

## 📊 Project Structure

```
Todo-App/
├── backend/              # FastAPI application
│   ├── src/
│   │   ├── api/         # REST endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── db/          # Database session
│   │   └── auth/        # Auth dependencies
│   ├── tests/           # Unit & integration tests
│   ├── alembic/         # Database migrations
│   └── Dockerfile       # Production container
├── frontend/            # Next.js application
│   ├── app/            # Next.js App Router
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API client
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
├── .github/
│   └── workflows/      # CI/CD pipelines
└── specs/              # Feature specifications
```

---

## 🔑 Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host/db
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| GET | `/api/{user_id}/tasks` | 100/min | List tasks |
| POST | `/api/{user_id}/tasks` | 20/min | Create task |
| GET | `/api/{user_id}/tasks/{id}` | 100/min | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | 20/min | Update task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | 30/min | Toggle complete |
| DELETE | `/api/{user_id}/tasks/{id}` | 20/min | Delete task |

**Query Parameters**:
- `completed=true|false` - Filter by status
- `limit=100` - Pagination limit (max 1000)
- `offset=0` - Pagination offset

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=src --cov-report=term-missing

# Frontend tests (when implemented)
cd frontend
npm test -- --coverage

# E2E tests (when implemented)
cd frontend
npm run test:e2e
```

---

## 🔒 Security Features

- ✅ Rate limiting (slowapi): 20-100 req/min per endpoint
- ✅ Security headers: X-Frame-Options, CSP, HSTS
- ✅ CORS: Restricted origins
- ✅ Input validation: Pydantic schemas
- ✅ SQL injection protection: SQLModel ORM
- ✅ XSS protection: React auto-escaping
- ⚠️ Authentication: Placeholder (Better Auth pending)

---

## 🚢 Deployment

### Quick Deploy (Recommended)
1. **Database**: Create Neon account → Copy connection string
2. **Backend**: Deploy to Railway → Set DATABASE_URL
3. **Frontend**: Deploy to Vercel → Set NEXT_PUBLIC_API_URL
4. **Migrations**: `railway run alembic upgrade head`

### Full Guide
See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Railway, Render, Fly.io deployment
- Environment variables
- Rollback procedures
- Troubleshooting

---

## 📚 Documentation

| Document | Read this for... |
|----------|------------------|
| [README.md](README.md) | Project overview, setup, API reference |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment steps |
| [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) | Pre-launch verification |
| [SECURITY_REVIEW.md](SECURITY_REVIEW.md) | Security audit findings |
| [FINAL_SUMMARY.md](FINAL_SUMMARY.md) | Complete project summary |
| [QUICKSTART.md](QUICKSTART.md) | Integration scenarios |

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check database connection
psql $DATABASE_URL

# Check migrations
alembic current
alembic upgrade head

# Check logs
docker-compose logs backend
```

### Frontend build fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### CORS errors
- Verify `CORS_ORIGINS` in backend/.env matches frontend URL
- Check protocol (http vs https)
- No trailing slashes in URLs

### Rate limit exceeded
- Default: 200/minute globally
- Endpoint limits: 20-100/minute
- Wait 60 seconds or increase limits in backend/src/main.py

---

## 📊 Task Progress

**Overall**: 67/79 tasks (85%)

- ✅ Phase 1: Setup (88%)
- ✅ Phase 2: Infrastructure (93%)
- ✅ Phase 3: US1 Workspace (100%)
- ✅ Phase 4: US2 Lifecycle (100%)
- ✅ Phase 5: US3 Resilience (100%)
- 🚧 Phase 6: Polish (74%)

**Remaining**: Better Auth, manual deployment, monitoring

---

## 🎯 Next Steps

1. **For Development**: `docker-compose up -d` → http://localhost:3000
2. **For Production**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
3. **For Testing**: `pytest backend/tests/`
4. **For Review**: Read [FINAL_SUMMARY.md](FINAL_SUMMARY.md)

---

## 🆘 Get Help

- API Docs: http://localhost:8000/docs
- Security Review: [SECURITY_REVIEW.md](SECURITY_REVIEW.md)
- Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Full Docs: [README.md](README.md)

---

**Version**: 1.0.0-beta | **Status**: Ready for beta testing 🎉
