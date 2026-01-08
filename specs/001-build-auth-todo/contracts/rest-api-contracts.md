# REST API Contracts: Authenticated Web-Based Todo Application

**Endpoint Family**: Task CRUD + Authentication  
**Protocol**: HTTP/REST with JSON  
**Base URL**: `https://api.example.com` (configurable per environment)  
**Auth**: Better Auth token (Bearer token in Authorization header)

---

## Authentication

Every endpoint requires a valid Better Auth token in the HTTP Authorization header:

```
Authorization: Bearer <token>
```

**Token Claims** (expected):
```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "iat": 1704686400,
  "exp": 1704690000
}
```

**Validation Rules**:
- Token signature must be valid (verified against Better Auth's public key).
- Token must not be expired (check `exp` claim).
- If token is missing, invalid, or expired: return **401 Unauthorized**.

---

## Common Response Format

### Success Response (2xx)
```json
{
  "data": { /* response payload */ },
  "status": 200,
  "message": "OK"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* optional context */ }
  },
  "status": 400
}
```

**Error Codes**:
- `UNAUTHORIZED`: Missing or invalid token (401).
- `FORBIDDEN`: User ID mismatch or insufficient permissions (403).
- `NOT_FOUND`: Task ID does not exist (404).
- `VALIDATION_ERROR`: Request payload validation failed (400).
- `INTERNAL_ERROR`: Server-side error (500).
- `SERVICE_UNAVAILABLE`: Database or external service unreachable (503).

---

## Endpoint: List Tasks

**Method**: `GET`  
**Path**: `/api/{user_id}/tasks`  
**Auth**: Required (Bearer token)

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID (must match token claim) |

### Query Parameters
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `completed` | boolean | null | Filter by completion status (optional) |
| `limit` | integer | 100 | Max tasks to return (1–1000) |
| `offset` | integer | 0 | Pagination offset |

### Request Example
```
GET /api/550e8400-e29b-41d4-a716-446655440000/tasks?completed=false&limit=20
Authorization: Bearer eyJhbGc...
```

### Success Response (200 OK)
```json
{
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "description": "Buy groceries",
      "completed": false,
      "due_date": "2026-01-08T17:30:00Z",
      "created_at": "2026-01-07T10:00:00Z",
      "updated_at": "2026-01-07T10:00:00Z"
    },
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "description": "Finish report",
      "completed": true,
      "due_date": null,
      "created_at": "2026-01-06T14:30:00Z",
      "updated_at": "2026-01-07T09:15:00Z"
    }
  ],
  "status": 200,
  "message": "Tasks retrieved successfully",
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  },
  "status": 401
}
```

### Error Response (403 Forbidden)
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "User ID in path does not match authenticated user"
  },
  "status": 403
}
```

---

## Endpoint: Create Task

**Method**: `POST`  
**Path**: `/api/{user_id}/tasks`  
**Auth**: Required (Bearer token)

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |

### Request Body (JSON)
```json
{
  "description": "Buy groceries",
  "due_date": "2026-01-08T17:30:00Z"
}
```

### Request Schema
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | string | Yes | Min 1 char, max 200 chars |
| `due_date` | datetime (ISO 8601) | No | Valid RFC 3339 timestamp, in future (optional) |

### Success Response (201 Created)
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "description": "Buy groceries",
    "completed": false,
    "due_date": "2026-01-08T17:30:00Z",
    "created_at": "2026-01-07T10:00:00Z",
    "updated_at": "2026-01-07T10:00:00Z"
  },
  "status": 201,
  "message": "Task created successfully"
}
```

### Error Response (400 Validation Error)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "description": "must not exceed 200 characters"
    }
  },
  "status": 400
}
```

---

## Endpoint: Get Task

**Method**: `GET`  
**Path**: `/api/{user_id}/tasks/{task_id}`  
**Auth**: Required (Bearer token)

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task to retrieve |

### Success Response (200 OK)
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "description": "Buy groceries",
    "completed": false,
    "due_date": "2026-01-08T17:30:00Z",
    "created_at": "2026-01-07T10:00:00Z",
    "updated_at": "2026-01-07T10:00:00Z"
  },
  "status": 200,
  "message": "Task retrieved successfully"
}
```

### Error Response (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  },
  "status": 404
}
```

---

## Endpoint: Update Task

**Method**: `PUT`  
**Path**: `/api/{user_id}/tasks/{task_id}`  
**Auth**: Required (Bearer token)

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task to update |

### Request Body (JSON)
```json
{
  "description": "Buy groceries and cook dinner",
  "due_date": "2026-01-09T19:00:00Z"
}
```

### Request Schema
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | string | No | Min 1 char, max 200 chars (if provided) |
| `due_date` | datetime (ISO 8601) | No | Valid RFC 3339 timestamp (if provided) |

### Success Response (200 OK)
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "description": "Buy groceries and cook dinner",
    "completed": false,
    "due_date": "2026-01-09T19:00:00Z",
    "created_at": "2026-01-07T10:00:00Z",
    "updated_at": "2026-01-07T10:05:00Z"
  },
  "status": 200,
  "message": "Task updated successfully"
}
```

---

## Endpoint: Toggle Task Completion

**Method**: `PATCH`  
**Path**: `/api/{user_id}/tasks/{task_id}/complete`  
**Auth**: Required (Bearer token)

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task to toggle |

### Request Body (JSON)
Empty body or explicit toggle:
```json
{
  "completed": true
}
```

### Success Response (200 OK)
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "description": "Buy groceries",
    "completed": true,
    "due_date": "2026-01-08T17:30:00Z",
    "created_at": "2026-01-07T10:00:00Z",
    "updated_at": "2026-01-07T10:10:00Z"
  },
  "status": 200,
  "message": "Task completion toggled successfully"
}
```

---

## Endpoint: Delete Task

**Method**: `DELETE`  
**Path**: `/api/{user_id}/tasks/{task_id}`  
**Auth**: Required (Bearer token)

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `user_id` | UUID | Yes | Authenticated user's ID |
| `task_id` | UUID | Yes | Task to delete |

### Success Response (204 No Content)
```
(Empty body)
Status: 204 No Content
```

### Alternative Response (200 OK with confirmation)
```json
{
  "data": null,
  "status": 200,
  "message": "Task deleted successfully"
}
```

---

## Performance & Reliability Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Response Time (p95) | <1.2 seconds | For 20 sequential CRUD operations |
| Availability | 99.9% | Per SLA (Neon + cloud provider) |
| Error Rate | <0.1% | Legitimate 4xx/5xx responses, excluding client errors |
| Data Durability | 99.99% | Neon's 3-way replication guarantee |

---

## Rate Limiting (Future Enhancement)

**Not implemented in MVP**, but recommended for production:
- Per-user request limit: 100 requests/minute to `/api/{user_id}/tasks`.
- Per-user task limit: 1000 tasks maximum (soft).
- Return `429 Too Many Requests` if exceeded.

---

## CORS & Security Headers

**CORS Policy**:
- Allowed Origins: `https://app.example.com`, `http://localhost:3000` (dev)
- Allowed Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allowed Headers: `Authorization, Content-Type`
- Max Age: 3600 seconds

**Security Headers**:
```
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## Summary

This contract defines:
- **6 RESTful endpoints** for task CRUD + completion toggle.
- **Consistent request/response format** with structured error codes.
- **Bearer token authentication** on every endpoint.
- **User ID path validation** to prevent cross-user data access.
- **Pagination** for list endpoint (limit/offset).
- **Performance targets** aligned with the feature spec (p95 <1.2s).

All endpoints return JSON with standard HTTP status codes (2xx for success, 4xx for client errors, 5xx for server errors).
