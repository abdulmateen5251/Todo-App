# Docker Setup Guide

## Overview
This project uses Docker to containerize the entire application stack:
- **Frontend**: Next.js 14 in Node.js 20 Alpine
- **Backend**: FastAPI with Python 3.11
- **Database**: PostgreSQL 15 Alpine

## Prerequisites
- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- At least 4GB RAM allocated to Docker
- Ports 3000, 8000, 5432 available

## Quick Start

### Production Mode
```bash
# Start all services
./docker.sh up

# View services status
./docker.sh status

# View logs
./docker.sh logs

# Stop services
./docker.sh down
```

### Development Mode
```bash
# Start with hot reload and debugging
./docker.sh up-dev

# View backend logs only
./docker.sh logs-backend

# Access frontend shell
./docker.sh shell-frontend

# Stop services
./docker.sh down
```

## Service URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## Docker Commands Reference

### Management
```bash
./docker.sh up              # Start services (background)
./docker.sh up-dev          # Start services (foreground, dev mode)
./docker.sh down            # Stop services
./docker.sh build           # Build services
./docker.sh rebuild         # Rebuild without cache
./docker.sh clean           # Remove all containers and volumes
./docker.sh status          # Show service status
```

### Logging
```bash
./docker.sh logs            # All logs
./docker.sh logs-backend    # Backend logs
./docker.sh logs-frontend   # Frontend logs
./docker.sh logs-postgres   # Database logs
```

### Interactive Access
```bash
./docker.sh shell-backend   # Bash shell in backend
./docker.sh shell-frontend  # Shell in frontend
./docker.sh shell-db        # PostgreSQL psql shell
```

## Docker Compose Files

### docker-compose.yml (Production)
- Uses production-optimized build
- Next.js builds and runs in production mode
- Includes health checks
- Proper networking between services

### docker-compose.dev.yml (Development)
- Uses development Dockerfile with hot reload
- npm run dev for frontend
- uvicorn --reload for backend
- Mounted volumes for code changes
- stdin/tty for interactive debugging

## Networking
Services communicate through a custom Docker network (`todo-network`):
- Frontend accesses backend via: `http://backend:8000`
- Backend connects to database via: `postgresql://postgres:postgres@postgres:5432/todo_dev`

## Environment Variables

### Backend (.env in backend/)
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/todo_dev
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
DEBUG=true
```

### Frontend (.env.local in frontend/)
```env
NEXT_PUBLIC_API_URL=http://backend:8000    # In Docker
# or
NEXT_PUBLIC_API_URL=http://localhost:8000  # Locally
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port
lsof -i :3000        # Find what's using port 3000
kill -9 <PID>        # Kill the process

# Or use different port
docker-compose -f docker-compose.yml up -p 3001:3000 backend
```

### Container Won't Start
```bash
# Check logs
./docker.sh logs

# Rebuild from scratch
./docker.sh clean
./docker.sh rebuild
./docker.sh up
```

### Database Connection Issues
```bash
# Connect to database
./docker.sh shell-db

# Check database exists
\l

# Exit psql
\q
```

### Frontend Can't Connect to Backend
1. Check if backend is running: `./docker.sh status`
2. Verify network: `docker network ls`
3. Check backend logs: `./docker.sh logs-backend`
4. Ensure `NEXT_PUBLIC_API_URL=http://backend:8000` in frontend container

## Performance Tuning

### Increase Docker Memory
Edit Docker Desktop settings or `/etc/docker/daemon.json`:
```json
{
  "memory": 4096,
  "cpus": 2.0
}
```

### Faster Builds
```bash
# Use BuildKit for faster, parallel builds
DOCKER_BUILDKIT=1 docker-compose build
```

### Reduce Image Size
Images are optimized with:
- Alpine Linux base images
- Multi-stage builds where applicable
- .dockerignore files

## Health Checks
All services include health checks that run every 30 seconds:
- **Backend**: Checks `/docs` endpoint
- **Frontend**: Checks `http://localhost:3000`
- **Database**: Uses `pg_isready`

View health status:
```bash
./docker.sh status
```

## Volumes
- `postgres_data`: Persists database across container restarts
- Frontend/Backend: Source code mounted for live editing in dev mode

## Security Considerations
- Credentials are read from environment variables
- Database only accessible within Docker network
- CORS configured for specific origins
- Security headers added to API responses

## Production Deployment
For production:
1. Use `docker-compose.yml` (not `.dev`)
2. Set `NODE_ENV=production`, `ENVIRONMENT=production`
3. Use strong database passwords
4. Configure HTTPS/SSL
5. Set proper CORS origins
6. Use environment-specific `.env` files
7. Set up log aggregation
8. Configure health checks and restart policies

## Help
```bash
./docker.sh help
```

## Additional Resources
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment/docker)
- [FastAPI Docker Documentation](https://fastapi.tiangolo.com/deployment/docker/)
