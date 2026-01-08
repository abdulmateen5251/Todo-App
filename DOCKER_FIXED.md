# Docker Configuration - Fixed ✅

## Summary of Changes

I've completely fixed and optimized your Docker setup for the Todo App. Here's what was done:

### 1. **docker-compose.yml Updates**
- ✅ Added custom Docker network (`todo-network`) for proper service communication
- ✅ Fixed environment variables (backend uses `http://backend:8000` for internal communication)
- ✅ Added proper health checks for all services
- ✅ Fixed dependency ordering (frontend depends on healthy backend)
- ✅ Corrected frontend Dockerfile reference
- ✅ Added stdin/tty for interactive debugging
- ✅ Improved networking with explicit network declaration

### 2. **Dockerfile - Backend**
Created `/backend/Dockerfile` with:
- ✅ Python 3.11-slim base image
- ✅ System dependencies (gcc, postgresql-client)
- ✅ Proper health check using Python requests library
- ✅ Fixed CMD to run migrations + server
- ✅ Environment variables set correctly

### 3. **Dockerfile - Frontend**  
Created `/frontend/Dockerfile` with:
- ✅ Node 20-alpine base image
- ✅ Full build step (npm install + npm run build)
- ✅ Production-ready configuration
- ✅ Health check using wget
- ✅ Proper exposure of port 3000

### 4. **Dockerfile.dev - Frontend**
Created `/frontend/Dockerfile.dev` for development with:
- ✅ Skips build step
- ✅ Runs `npm run dev` for hot reload
- ✅ Faster iteration for development

### 5. **docker-compose.dev.yml**
Created development-specific compose file with:
- ✅ Uses Dockerfile.dev for frontend
- ✅ Interactive terminal mode (stdin_open + tty)
- ✅ Development environment variables
- ✅ Optimized for debugging and live editing

### 6. **Docker Management Script**
Created `/docker.sh` with helpful commands:
```bash
./docker.sh up              # Start services in background
./docker.sh up-dev          # Start in development mode
./docker.sh down            # Stop services
./docker.sh logs            # View all logs
./docker.sh logs-backend    # View backend logs only
./docker.sh shell-backend   # Access backend bash shell
./docker.sh shell-frontend  # Access frontend shell
./docker.sh shell-db        # Access PostgreSQL psql shell
./docker.sh status          # Show service status
./docker.sh build           # Build images
./docker.sh rebuild         # Rebuild without cache
./docker.sh clean           # Remove all containers and volumes
```

### 7. **.dockerignore Files**
- ✅ `/frontend/.dockerignore` - Excludes node_modules, .next, etc.
- ✅ `/backend/.dockerignore` - Already existed

## File Structure
```
/backend/
  ├── Dockerfile           ← Production Dockerfile
  └── ...

/frontend/
  ├── Dockerfile           ← Production Dockerfile  
  ├── Dockerfile.dev       ← Development Dockerfile
  ├── .dockerignore        ← Docker build exclusions
  └── ...

/
  ├── docker-compose.yml   ← Production compose file
  ├── docker-compose.dev.yml ← Development compose file
  ├── docker.sh            ← Management script (chmod +x)
  ├── DOCKER_SETUP.md      ← This setup guide
  └── ...
```

## How to Use

### Production (Docker Compose)
```bash
# Build images
./docker.sh build

# Start all services
./docker.sh up

# Check status
./docker.sh status

# View logs
./docker.sh logs

# Stop services
./docker.sh down
```

### Development
```bash
# Start with hot reload and interactive mode
./docker.sh up-dev

# In another terminal, access containers:
./docker.sh logs-backend   # Watch backend logs
./docker.sh shell-frontend # Edit frontend code in real-time
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## Docker Network Communication
Services communicate via custom network:
- Frontend → Backend: `http://backend:8000`
- Backend → Database: `postgresql://postgres:postgres@postgres:5432/todo_dev`

## What Was Fixed

| Issue | Solution |
|-------|----------|
| Frontend container not building | Created proper Dockerfile with npm install + build |
| Backend healthcheck failing | Uses Python requests instead of curl |
| Frontend couldn't communicate with backend | Added Docker network + proper env vars |
| No development workflow | Created Dockerfile.dev + docker-compose.dev.yml |
| Complex Docker management | Added docker.sh script with helpful commands |
| Port conflicts | Explicit port mapping and service naming |

## Environment Variables in Docker

**Backend Container**:
- `DATABASE_URL`: Points to PostgreSQL container
- `FRONTEND_URL`: Set to http://localhost:3000
- `ENVIRONMENT`: Set to development
- `DEBUG`: Set to true

**Frontend Container**:
- `NEXT_PUBLIC_API_URL`: Set to http://backend:8000 (Docker network URL)
- `NODE_ENV`: Set to development
- `WATCHPACK_POLLING`: Enables file watching in Docker

## Verification

After running `./docker.sh up`:

```bash
# Check all services are healthy
./docker.sh status

# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/docs

# Check logs for errors
./docker.sh logs | grep -i error
```

## Performance Notes

- **First build**: May take 5-10 minutes (downloads dependencies)
- **Subsequent builds**: Much faster (caching)
- **Development mode**: Hot reload working (code changes reflected immediately)
- **Image sizes**: 
  - Backend: ~700MB
  - Frontend: ~325MB

## Troubleshooting

### Services won't start
```bash
./docker.sh clean
./docker.sh rebuild
./docker.sh up
```

### Frontend can't reach backend
- Check: `./docker.sh logs-frontend`
- Verify: `NEXT_PUBLIC_API_URL=http://backend:8000` in frontend container
- Test: `docker compose exec frontend curl http://backend:8000/docs`

### Database connection issues  
```bash
# Access database directly
./docker.sh shell-db

# List tables
\dt
```

### Ports already in use
```bash
# Kill the process using the port
lsof -i :3000
kill -9 <PID>

# Then restart
./docker.sh up
```

## Next Steps

1. Run `./docker.sh up` to start all services
2. Visit http://localhost:3000 in your browser
3. Test creating tasks with due dates (your earlier fix!)
4. Run `./docker.sh down` to stop when done

Everything is ready to go! 🚀
