# Quickstart: Authenticated Web-Based Todo Application

**Target Audience**: Developers implementing the feature  
**Duration**: ~2 hours for initial setup (backend + frontend scaffolding)  
**Prerequisites**: Node.js 20+, Python 3.11+, Neon account, Better Auth account

---

## 1. Backend Setup (FastAPI + SQLModel + Neon PostgreSQL)

### 1.1 Initialize Python Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Python virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlmodel==0.0.14
psycopg2-binary==2.9.9
alembic==1.12.0
pydantic==2.5.0
python-jose[cryptography]==3.3.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.0
EOF

# Install dependencies
pip install -r requirements.txt
```

### 1.2 Set Up Environment Variables

```bash
# Create .env file
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@host:5432/todos_db

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://better-auth.example.com

# CORS
FRONTEND_URL=http://localhost:3000
EOF
```

### 1.3 Create FastAPI Application Structure

```bash
# Create source directory
mkdir -p src/api src/models src/schemas src/auth src/db

# Create __init__.py files
touch src/__init__.py src/api/__init__.py src/models/__init__.py src/schemas/__init__.py src/auth/__init__.py src/db/__init__.py

# Create main application file
cat > src/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Todo API", version="1.0.0")

# CORS Configuration
origins = [os.getenv("FRONTEND_URL", "http://localhost:3000")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Import and include routers (will add later)
# from src.api.tasks import router as tasks_router
# app.include_router(tasks_router, prefix="/api", tags=["tasks"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF
```

### 1.4 Define SQLModel Entities

```bash
cat > src/models/task.py << 'EOF'
from sqlmodel import SQLModel, Field, Column, String
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")
    description: str = Field(max_length=200)
    completed: bool = Field(default=False)
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        table_args = ({"indexes": ("user_id",)},)

class User(SQLModel, table=True):
    id: UUID = Field(primary_key=True)
    email: str = Field(unique=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
EOF
```

### 1.5 Database Connection

```bash
cat > src/db/session.py << 'EOF'
from sqlmodel import create_engine, SQLSession, Session
from sqlalchemy.pool import NullPool
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# For PostgreSQL with Neon, use NullPool for serverless
engine = create_engine(DATABASE_URL, poolclass=NullPool)

def get_session():
    with Session(engine) as session:
        yield session
EOF
```

### 1.6 Authentication Dependency

```bash
cat > src/auth/dependencies.py << 'EOF'
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import os
import json
from typing import Optional
from uuid import UUID

security = HTTPBearer()

async def validate_token(credentials: HTTPAuthCredentials = Depends(security)) -> UUID:
    """
    Validate Better Auth token and extract user_id.
    In production, verify the token signature against Better Auth's public keys.
    """
    token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    
    # TODO: Verify token signature and extract claims
    # For MVP, assume token is valid and contains user_id in sub claim
    # This requires Better Auth public key and JWT validation
    
    try:
        # Placeholder: decode token to extract user_id
        # In production, use jose.jwt.decode with public keys
        user_id = extract_user_id_from_token(token)
        return user_id
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def extract_user_id_from_token(token: str) -> UUID:
    """Extract user_id from Better Auth JWT token."""
    # Placeholder implementation
    # In production, validate signature and extract 'sub' claim
    raise NotImplementedError("Implement Better Auth token validation")
EOF
```

### 1.7 Request/Response Schemas

```bash
cat > src/schemas/task.py << 'EOF'
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional

class TaskCreate(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    due_date: Optional[datetime] = None

class TaskUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: UUID
    description: str
    completed: bool
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
EOF
```

### 1.8 CRUD API Endpoints

```bash
cat > src/api/tasks.py << 'EOF'
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from uuid import UUID
from src.db.session import get_session
from src.auth.dependencies import validate_token
from src.models.task import Task
from src.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter()

@router.get("/{user_id}/tasks", response_model=list[TaskResponse])
async def list_tasks(user_id: UUID, session: Session = Depends(get_session), 
                     auth_user_id: UUID = Depends(validate_token)):
    if user_id != auth_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
    return tasks

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(user_id: UUID, task_create: TaskCreate, 
                      session: Session = Depends(get_session),
                      auth_user_id: UUID = Depends(validate_token)):
    if user_id != auth_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    db_task = Task(user_id=user_id, **task_create.dict())
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(user_id: UUID, task_id: UUID, session: Session = Depends(get_session),
                   auth_user_id: UUID = Depends(validate_token)):
    if user_id != auth_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(user_id: UUID, task_id: UUID, task_update: TaskUpdate,
                      session: Session = Depends(get_session),
                      auth_user_id: UUID = Depends(validate_token)):
    if user_id != auth_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    task_data = task_update.dict(exclude_unset=True)
    for field, value in task_data.items():
        setattr(task, field, value)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(user_id: UUID, task_id: UUID,
                                session: Session = Depends(get_session),
                                auth_user_id: UUID = Depends(validate_token)):
    if user_id != auth_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    task.completed = not task.completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(user_id: UUID, task_id: UUID,
                     session: Session = Depends(get_session),
                     auth_user_id: UUID = Depends(validate_token)):
    if user_id != auth_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    session.delete(task)
    session.commit()
EOF
```

### 1.9 Start Backend Server

```bash
cd backend
python src/main.py
# Server runs on http://localhost:8000
```

---

## 2. Frontend Setup (Next.js 16+ App Router + Better Auth)

### 2.1 Initialize Next.js Project

```bash
# From project root
npx create-next-app@latest frontend --typescript --app

cd frontend

# Install dependencies
npm install next-auth better-auth @tanstack/react-query tailwindcss
npm install --save-dev @types/node @types/react
```

### 2.2 Configure Environment Variables

```bash
# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
BETTER_AUTH_CLIENT_ID=your-client-id
BETTER_AUTH_CLIENT_SECRET=your-client-secret
EOF
```

### 2.3 Set Up NextAuth with Better Auth

```bash
# Create app/api/auth/[...nextauth]/route.ts
mkdir -p app/api/auth

cat > app/api/auth/\[...nextauth\]/route.ts << 'EOF'
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import BetterAuthProvider from "next-auth/providers/credentials"; // Placeholder

const handler = NextAuth({
  providers: [
    // Configure Better Auth provider
    // See: https://betterauth.dev/docs
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
EOF
```

### 2.4 Create Tailwind CSS Layout

```bash
cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo App",
  description: "Authenticated todo application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
EOF
```

### 2.5 Create Protected Dashboard Page

```bash
cat > app/page.tsx << 'EOF'
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("better-auth");
    }
  }, [status]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
        {/* TaskList component will go here */}
        <p className="text-gray-500">Tasks will appear here.</p>
      </main>
    </div>
  );
}
EOF
```

### 2.6 Create Task Components

```bash
mkdir -p components

cat > components/TaskList.tsx << 'EOF'
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Task {
  id: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function TaskList() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/${session.user?.id}/tasks`,
          {
            headers: {
              "Authorization": `Bearer ${session.user?.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [session?.user?.id, session?.user?.token]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks yet. Create one!</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded shadow flex items-center justify-between"
          >
            <span className={task.completed ? "line-through text-gray-500" : ""}>
              {task.description}
            </span>
            <input type="checkbox" checked={task.completed} className="ml-4" />
          </div>
        ))
      )}
    </div>
  );
}
EOF
```

### 2.7 Start Frontend Server

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 3. Database Setup (Neon PostgreSQL)

### 3.1 Create Neon Project

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update backend `.env` with `DATABASE_URL`

### 3.2 Run Database Migrations

```bash
cd backend

# Initialize Alembic (if not done)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

---

## 4. Testing the Full Flow

### 4.1 Test Backend API (curl)

```bash
# Create a task
curl -X POST http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Buy groceries", "due_date": "2026-01-08T17:30:00Z"}'

# List tasks
curl http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Toggle completion
curl -X PATCH http://localhost:8000/api/{user_id}/tasks/{task_id}/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.2 Test Frontend

1. Navigate to http://localhost:3000
2. Sign in with Better Auth
3. Create, edit, complete, and delete tasks
4. Verify tasks persist across page refresh

---

## 5. Deployment Checklist

- [ ] Backend: Deploy to cloud provider (Render, Railway, AWS Lambda)
- [ ] Frontend: Deploy to Vercel
- [ ] Database: Create production Neon database
- [ ] Secrets: Configure env vars in deployment platform
- [ ] CORS: Update frontend URL in backend
- [ ] SSL/TLS: Enable HTTPS on both services
- [ ] Monitoring: Set up error tracking (Sentry)
- [ ] Testing: Run integration tests before deploying

---

## Common Issues & Solutions

### Issue: 401 Unauthorized on API calls
**Solution**: Ensure Better Auth token is valid and passed in Authorization header.

### Issue: 403 Forbidden on API calls
**Solution**: Verify that the user_id in the URL path matches the authenticated user's ID.

### Issue: CORS errors
**Solution**: Add frontend origin to FastAPI's CORS configuration.

### Issue: Database connection fails
**Solution**: Verify Neon connection string and that Neon project is running.

---

## Summary

This quickstart sets up:
1. **Backend**: FastAPI + SQLModel + Neon PostgreSQL
2. **Frontend**: Next.js 16+ App Router + Better Auth + Tailwind CSS
3. **Auth**: Token-based authentication with Better Auth
4. **API**: 6 RESTful endpoints for task CRUD
5. **Database**: PostgreSQL schema with user-scoped task isolation

**Next steps**: Implement full error handling, write comprehensive tests, and deploy to production.
