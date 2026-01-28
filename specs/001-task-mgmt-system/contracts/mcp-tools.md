# MCP Tool Definitions

**Purpose**: This document defines all Model Context Protocol (MCP) tools exposed to the OpenAI Agents SDK for task management operations.

## Tool Registration

All tools are registered with the OpenAI Agents SDK as function calling definitions. Each tool maps to a Python async function that performs database operations via SQLModel.

## Tool Catalog

### 1. add_task

Creates a new task for the authenticated user.

**OpenAI Function Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "add_task",
    "description": "Create a new task for the user with optional details like description, due date, priority, and category.",
    "parameters": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "The task title (required). Must not be empty.",
          "minLength": 1,
          "maxLength": 500
        },
        "description": {
          "type": "string",
          "description": "Optional detailed description of the task.",
          "maxLength": 5000
        },
        "due_date": {
          "type": "string",
          "format": "date-time",
          "description": "Optional due date in ISO 8601 format (e.g., '2026-01-31T17:00:00Z')."
        },
        "priority": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "Optional priority level for the task."
        },
        "category": {
          "type": "string",
          "description": "Optional category to group tasks (e.g., 'work', 'personal').",
          "maxLength": 100
        }
      },
      "required": ["title"]
    }
  }
}
```

**Python Implementation Signature**:
```python
async def add_task(
    user_id: int,
    title: str,
    description: str | None = None,
    due_date: str | None = None,  # ISO 8601 datetime string
    priority: str | None = None,
    category: str | None = None
) -> dict
```

**Return Value**:
```json
{
  "success": true,
  "task_id": 42,
  "title": "Buy groceries",
  "status": "pending",
  "created_at": "2026-01-26T10:15:00Z"
}
```

**Error Cases**:
- Empty title → `{"success": false, "error": "Title cannot be empty"}`
- Invalid due_date format → `{"success": false, "error": "Invalid date format. Use ISO 8601."}`
- Invalid priority value → `{"success": false, "error": "Priority must be 'low', 'medium', or 'high'."}`

---

### 2. list_tasks

Retrieves all tasks for the authenticated user, optionally filtered by status.

**OpenAI Function Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "list_tasks",
    "description": "Retrieve all tasks for the user, optionally filtered by completion status.",
    "parameters": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": ["all", "pending", "completed"],
          "description": "Filter tasks by status. 'all' returns both pending and completed tasks.",
          "default": "all"
        }
      }
    }
  }
}
```

**Python Implementation Signature**:
```python
async def list_tasks(
    user_id: int,
    status: str = "all"
) -> dict
```

**Return Value**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 42,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "status": "pending",
      "priority": "medium",
      "category": "personal",
      "due_date": "2026-01-27T18:00:00Z",
      "created_at": "2026-01-26T10:15:00Z",
      "updated_at": "2026-01-26T10:15:00Z"
    },
    {
      "id": 43,
      "title": "Finish project report",
      "status": "completed",
      "completed_at": "2026-01-26T12:00:00Z",
      "created_at": "2026-01-25T09:00:00Z",
      "updated_at": "2026-01-26T12:00:00Z"
    }
  ],
  "count": 2
}
```

**Error Cases**:
- Invalid status value → `{"success": false, "error": "Status must be 'all', 'pending', or 'completed'."}`

---

### 3. update_task

Modifies properties of an existing task. Only updates fields provided in the request.

**OpenAI Function Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "update_task",
    "description": "Update properties of an existing task. Only provided fields will be modified.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "integer",
          "description": "The ID of the task to update (required)."
        },
        "title": {
          "type": "string",
          "description": "New task title.",
          "maxLength": 500
        },
        "description": {
          "type": "string",
          "description": "New task description.",
          "maxLength": 5000
        },
        "due_date": {
          "type": "string",
          "format": "date-time",
          "description": "New due date in ISO 8601 format."
        },
        "priority": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "New priority level."
        },
        "category": {
          "type": "string",
          "description": "New category.",
          "maxLength": 100
        }
      },
      "required": ["task_id"]
    }
  }
}
```

**Python Implementation Signature**:
```python
async def update_task(
    user_id: int,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
    due_date: str | None = None,
    priority: str | None = None,
    category: str | None = None
) -> dict
```

**Return Value**:
```json
{
  "success": true,
  "task_id": 42,
  "updated_fields": ["title", "due_date"],
  "updated_at": "2026-01-26T14:30:00Z"
}
```

**Error Cases**:
- Task not found → `{"success": false, "error": "Task with ID 42 not found."}`
- Task belongs to different user → `{"success": false, "error": "You do not have permission to modify this task."}`
- No fields provided → `{"success": false, "error": "At least one field must be provided for update."}`

---

### 4. complete_task

Marks a task as completed and sets the completion timestamp.

**OpenAI Function Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "complete_task",
    "description": "Mark a task as completed. This sets the task status to 'completed' and records the completion timestamp.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "integer",
          "description": "The ID of the task to mark as complete (required)."
        }
      },
      "required": ["task_id"]
    }
  }
}
```

**Python Implementation Signature**:
```python
async def complete_task(
    user_id: int,
    task_id: int
) -> dict
```

**Return Value**:
```json
{
  "success": true,
  "task_id": 42,
  "status": "completed",
  "completed_at": "2026-01-26T15:00:00Z"
}
```

**Error Cases**:
- Task not found → `{"success": false, "error": "Task with ID 42 not found."}`
- Task belongs to different user → `{"success": false, "error": "You do not have permission to complete this task."}`
- Task already completed → `{"success": false, "error": "Task is already marked as completed."}`

---

### 5. delete_task

Permanently removes a task from the system.

**OpenAI Function Schema**:
```json
{
  "type": "function",
  "function": {
    "name": "delete_task",
    "description": "Permanently delete a task from the system. This action cannot be undone.",
    "parameters": {
      "type": "object",
      "properties": {
        "task_id": {
          "type": "integer",
          "description": "The ID of the task to delete (required)."
        }
      },
      "required": ["task_id"]
    }
  }
}
```

**Python Implementation Signature**:
```python
async def delete_task(
    user_id: int,
    task_id: int
) -> dict
```

**Return Value**:
```json
{
  "success": true,
  "task_id": 42,
  "message": "Task 'Buy groceries' has been deleted."
}
```

**Error Cases**:
- Task not found → `{"success": false, "error": "Task with ID 42 not found."}`
- Task belongs to different user → `{"success": false, "error": "You do not have permission to delete this task."}`

---

## Tool Invocation Flow

1. **User sends message** via `/api/chat` endpoint
2. **FastAPI receives request**, validates JWT token, extracts user_id
3. **Conversation history fetched** from database for user_id
4. **Messages array built**: [history... + new user message]
5. **OpenAI Agents SDK invoked** with messages and tool definitions
6. **Agent analyzes intent** and determines if tool invocation needed
7. **If tool needed**: Agent returns function call request
8. **FastAPI executes tool** (e.g., `add_task(user_id, title="Buy groceries")`)
9. **Tool result returned** to agent
10. **Agent generates response** incorporating tool result
11. **Response stored** in database as assistant message
12. **Response returned** to client

## Security Constraints

**All tools enforce user isolation**:
- Every tool receives `user_id` from authenticated session (not from agent)
- Database queries MUST filter by `user_id` to prevent cross-user access
- Task IDs alone are insufficient—must verify `task.user_id == current_user_id`

**Example enforcement**:
```python
async def delete_task(user_id: int, task_id: int) -> dict:
    task = await db.get(Task, task_id)
    
    if not task:
        return {"success": False, "error": f"Task {task_id} not found"}
    
    # CRITICAL: Verify ownership before deletion
    if task.user_id != user_id:
        return {"success": False, "error": "Permission denied"}
    
    await db.delete(task)
    return {"success": True, "task_id": task_id}
```

## Tool Response Format

All tools return a consistent structure:
- `success` (bool): Whether operation succeeded
- Additional fields on success (e.g., `task_id`, `tasks`, `updated_at`)
- `error` (string) on failure: Human-readable error message

This enables the agent to:
1. Detect success/failure
2. Extract relevant data for response generation
3. Provide clear error explanations to users
