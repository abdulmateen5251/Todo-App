# Todo Application - Implementation Guide

**Feature**: Authenticated Web-Based Todo Application  
**Branch**: `001-build-auth-todo`  
**Status**: In Development  

## Documentation

- **[Specification](specs/001-build-auth-todo/spec.md)** – User stories, requirements, success criteria
- **[Implementation Plan](specs/001-build-auth-todo/plan.md)** – Technical context, architecture, project structure
- **[Tasks](specs/001-build-auth-todo/tasks.md)** – Implementation tasks organized by phase
- **[Data Model](specs/001-build-auth-todo/data-model.md)** – Entity definitions, relationships, database schema
- **[Research](specs/001-build-auth-todo/research.md)** – Technology decisions and rationale
- **[Quickstart](specs/001-build-auth-todo/quickstart.md)** – Setup guide for developers
- **[API Contracts](specs/001-build-auth-todo/contracts/)** – REST API and frontend client specifications

## Project Structure

```
.
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── main.py      # FastAPI app
│   │   ├── api/         # API endpoints
│   │   ├── models/      # SQLModel entities
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── auth/        # Authentication
│   │   └── db/          # Database session
│   ├── tests/           # Backend tests
│   ├── pyproject.toml   # Python dependencies
│   └── .env             # Backend environment vars
│
├── frontend/            # Next.js frontend
│   ├── app/             # Next.js App Router pages
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   ├── hooks/       # React hooks
│   │   └── types/       # TypeScript types
│   ├── tests/           # Frontend tests
│   ├── package.json     # Node dependencies
│   └── .env.local       # Frontend environment vars
│
└── specs/               # Feature specifications
    └── 001-build-auth-todo/
```

## Tech Stack

**Backend:**
- Python 3.11+
- FastAPI (async web framework)
- SQLModel (ORM with Pydantic validation)
- Neon Serverless PostgreSQL
- Better Auth (authentication)
- pytest (testing)

**Frontend:**
- Node.js 20+
- Next.js 16+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- NextAuth (Better Auth integration)
- React Query (data fetching)

## Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies (if venv works on your system)
python3 -m venv venv
source venv/bin/activate
pip install -e .

# Or use pip directly
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Neon PostgreSQL connection string

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload
# API available at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URL and auth credentials

# Start development server
npm run dev
# App available at http://localhost:3000
```

## Development Workflow

1. **Check tasks**: See [tasks.md](specs/001-build-auth-todo/tasks.md) for implementation checklist
2. **Implement feature**: Follow phase-by-phase execution order
3. **Run tests**: `pytest` (backend), `npm test` (frontend)
4. **Mark tasks complete**: Update checkboxes in tasks.md as you finish each task
5. **Validate**: Ensure acceptance criteria are met for each phase

## Current Phase

**Phase 1: Project Setup** (In Progress)
- [x] T001 Create backend project structure
- [x] T002 Create frontend project structure
- [x] T003 Set up Python virtual environment and dependencies
- [x] T004 Initialize Node.js project
- [x] T005 Configure environment files
- [x] T006 Set up git branching strategy
- [ ] T007 Initialize Neon PostgreSQL project
- [x] T008 Create root-level documentation

## Next Steps

1. Complete T007: Set up Neon PostgreSQL database
2. Move to Phase 2: Foundational Infrastructure
   - Define SQLModel entities
   - Set up authentication middleware
   - Create database migrations
3. Implement Phase 3: User Story 1 (Core feature)

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Neon Documentation](https://neon.tech/docs)
- [Better Auth Documentation](https://betterauth.dev/docs)

## Support

For implementation questions, refer to:
- [quickstart.md](specs/001-build-auth-todo/quickstart.md) for setup issues
- [research.md](specs/001-build-auth-todo/research.md) for technology decisions
- [contracts/](specs/001-build-auth-todo/contracts/) for API specifications
