# Authentication Fix - Complete Summary

## Problem Identified
The CORS error was caused by **incorrect API URL configuration** for server-side rendering (SSR) in Next.js.

### Root Cause
When Next.js runs the `authorize()` callback in NextAuth (server-side), it runs **inside the Docker container**. Using `localhost:8000` from inside the container tried to connect to the container itself, not the backend service.

## Solution Implemented

### 1. **Separate API URLs for Client and Server**
   - **Client-side** (browser): `NEXT_PUBLIC_API_URL=http://localhost:8000`
     - Browser runs on host machine, can access exposed ports
   - **Server-side** (SSR): `API_URL=http://backend:8000`
     - Docker containers use service names for networking

### 2. **Files Modified**

#### docker-compose.yml
```yaml
frontend:
  environment:
    # Browser-accessible URL (localhost from user's browser perspective)
    NEXT_PUBLIC_API_URL: http://localhost:8000
    # Server-side API URL (for SSR, uses Docker service name)
    API_URL: http://backend:8000
```

#### frontend/lib/auth.ts (Line 37)
```typescript
// Use API_URL for server-side calls (inside Docker), fallback to NEXT_PUBLIC for dev
const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

#### frontend/.env.local
```env
# For browser (client-side) access
NEXT_PUBLIC_API_URL=http://localhost:8000

# For server-side rendering (SSR)
API_URL=http://backend:8000
```

## Testing Results

### Backend API Tests ✅
- ✅ Registration endpoint working (HTTP 201)
- ✅ Login endpoint working (HTTP 200)
- ✅ CORS headers correctly configured
- ✅ JWT tokens generated successfully

### Environment Verification ✅
```bash
$ docker exec todo-frontend printenv | grep API_URL
API_URL=http://backend:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## How to Test in Browser

### Test Signup Flow
1. Open browser to: **http://localhost:3000/auth/signup**
2. Fill in the form:
   - Name: Any name
   - Email: Any valid email format
   - Password: At least 6 characters
   - Confirm Password: Same as password
3. Click "Create Account"
4. You should be redirected to the dashboard

### Test Signin Flow
1. Open browser to: **http://localhost:3000/auth/signin**
2. Use existing credentials
3. Click "Sign In"
4. You should be redirected to the dashboard

## Monitoring

### Watch Backend Logs
```bash
docker logs -f todo-backend
```

### Watch Frontend Logs
```bash
docker logs -f todo-frontend
```

### Check for CORS Errors
Open browser DevTools (F12) → Console tab → Look for:
- ❌ Red CORS errors = Problem
- ✅ No CORS errors + successful requests = Fixed!

## Quick Test Commands

### Test Registration from Command Line
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}' \
  -v 2>&1 | grep -i "access-control"
```

### Test Login from Command Line
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -v 2>&1 | grep -i "access-control"
```

## Expected Behavior

### Successful Signup:
1. Form submission sends POST to `http://localhost:8000/api/users/register`
2. Backend creates user in PostgreSQL
3. Frontend calls NextAuth signin
4. NextAuth calls backend at `http://backend:8000/api/users/login` (server-side)
5. JWT token stored in session
6. User redirected to dashboard

### Successful Signin:
1. Form submission triggers NextAuth signin
2. NextAuth calls backend at `http://backend:8000/api/users/login` (server-side)
3. Backend validates credentials
4. JWT token returned and stored
5. User redirected to dashboard

## Troubleshooting

### If signup/signin still fails:

1. **Clear browser cache**:
   ```
   Ctrl+Shift+Delete → Clear cache
   ```

2. **Restart all containers**:
   ```bash
   docker compose down
   docker compose up -d
   ```

3. **Check frontend logs for errors**:
   ```bash
   docker logs todo-frontend --tail 50
   ```

4. **Verify environment variables**:
   ```bash
   docker exec todo-frontend printenv | grep API_URL
   ```

5. **Test backend directly**:
   ```bash
   ./test_auth_ui.sh
   ```

## Key Learnings

1. **Docker Networking**: Containers communicate via service names, not localhost
2. **Next.js Environment Variables**: 
   - `NEXT_PUBLIC_*` = Client-side (browser)
   - Regular env vars = Server-side (SSR)
3. **CORS**: Must be configured on backend to allow frontend origin
4. **NextAuth**: Runs authorize() callback on server-side, needs internal Docker networking

## Status: ✅ FIXED

The authentication system is now properly configured for Docker deployment with correct API URLs for both client and server-side rendering.
