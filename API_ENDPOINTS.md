# ✅ API Endpoints - Complete & Verified

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: Your deployed URL

## All Task Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/api/{user_id}/tasks` | List all tasks for a user | - | Array of tasks |
| **POST** | `/api/{user_id}/tasks` | Create a new task | `TaskCreate` | Created task |
| **GET** | `/api/{user_id}/tasks/{id}` | Get specific task details | - | Task object |
| **PUT** | `/api/{user_id}/tasks/{id}` | Update an existing task | `TaskUpdate` | Updated task |
| **DELETE** | `/api/{user_id}/tasks/{id}` | Delete a task | - | 204 No Content |
| **PATCH** | `/api/{user_id}/tasks/{id}/complete` | Toggle task completion | - | Updated task |

## Request/Response Schemas

### TaskCreate (POST /api/{user_id}/tasks)
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and coffee beans",
  "status": "pending",
  "priority": "high",
  "category": "personal",
  "due_date": "2026-01-27T18:00:00Z"
}
```

### TaskUpdate (PUT /api/{user_id}/tasks/{id})
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "medium",
  "category": "work",
  "due_date": "2026-01-28T18:00:00Z"
}
```
*Note: All fields are optional in TaskUpdate*

### TaskResponse
```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, and coffee beans",
  "status": "pending",
  "priority": "high",
  "category": "personal",
  "due_date": "2026-01-27T18:00:00Z",
  "completed_at": null,
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T10:00:00Z"
}
```

## Query Parameters

### GET /api/{user_id}/tasks
- `completed` (optional): Filter by completion status (boolean)
- `limit` (optional): Max tasks to return (1-1000, default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```
GET /api/{user_id}/tasks?completed=false&limit=20&offset=0
```

## Field Enums

### TaskStatus
- `pending` - Task is not yet completed
- `completed` - Task is completed

### TaskPriority
- `low` - Low priority task
- `medium` - Medium priority task
- `high` - High priority task

## Authentication

All endpoints require authentication via Better Auth JWT token:

```http
Authorization: Bearer <your-jwt-token>
```

The `user_id` in the path must match the authenticated user's ID.

## Error Responses

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title cannot be empty"
  },
  "status": 400
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied"
  },
  "status": 403
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  },
  "status": 404
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  },
  "status": 500
}
```

## Rate Limits

- **List/Get Tasks**: 100 requests/minute
- **Create/Update/Delete**: 20 requests/minute
- **Toggle Completion**: 30 requests/minute

## Database Schema

### tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description VARCHAR(5000),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(50),
    category VARCHAR(100),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Current Status

✅ **All endpoints are operational and verified**

- Database: PostgreSQL (todo_dev)
- Total Users: 3
- Total Tasks: 1
- Backend: Running on http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing

You can test the API using:
1. **Swagger UI**: http://localhost:8000/docs
2. **cURL**: See `test_api_endpoints.sh`
3. **Frontend**: Your Next.js app
4. **Postman/Insomnia**: Import OpenAPI spec from http://localhost:8000/openapi.json

---

**Last Updated**: January 27, 2026
**Status**: ✅ All systems operational
