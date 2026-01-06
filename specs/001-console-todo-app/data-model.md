# Data Model: In-Memory Python Console-Based Todo Application

**Feature**: 001-console-todo-app  
**Date**: January 7, 2026  
**Source**: Derived from [spec.md](spec.md) requirements and [research.md](research.md) decisions

## Overview

This document defines the data structures and their relationships for the todo application. The model is intentionally simple, using Python dataclasses and built-in collections to represent a single entity type: Todo.

---

## Entities

### Todo

Represents a single task with unique identifier, description, and completion status.

**Attributes**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `int` | Yes | N/A | Unique identifier, auto-assigned, immutable |
| `description` | `str` | Yes | N/A | Task description, 1-200 characters |
| `completed` | `bool` | No | `False` | Completion status (True = done, False = pending) |

**Validation Rules**:
- `id`: Must be positive integer, unique within collection, never reused
- `description`: Non-empty after stripping whitespace, max 200 characters (FR-002)
- `completed`: Boolean only, no null/undefined state

**State Transitions**:
- Created → `completed = False`
- Mark Complete → `completed = True`
- Can update `description` in any state without affecting `completed` (FR-009)
- Can mark already-complete todo as complete (idempotent operation)

**Invariants**:
- Every Todo has exactly one `id`
- `id` never changes after creation
- `description` cannot be empty string
- `completed` is always explicitly True or False

---

## Collections

### TodoList (Internal Storage)

In-memory collection managing all todos.

**Structure**:
```python
todos: dict[int, Todo] = {}  # Maps todo ID to Todo object
next_id: int = 1              # Monotonically increasing ID counter
```

**Operations**:
- **Add**: Assign `next_id`, store todo, increment counter
- **Get by ID**: O(1) dictionary lookup
- **Update**: Lookup by ID, modify in place
- **Delete**: Remove from dictionary, do not renumber IDs
- **List All**: Return all values, optionally filtered by `completed` status
- **Count**: Total todos, pending todos, completed todos

**ID Management**:
- IDs start at 1 (more intuitive for users than 0)
- IDs increment sequentially but may have gaps after deletions
- Deleted IDs are never reused (maintains audit trail if extended later)

---

## Relationships

No relationships - single entity model. Each Todo is independent.

---

## Data Flow

```
User Input (CLI)
    ↓
Validation (services layer)
    ↓
Todo Object Creation/Modification
    ↓
TodoList Storage (in-memory dict)
    ↓
Query/Display (CLI output)
```

---

## Example Data States

### Empty State (Initial)
```python
todos = {}
next_id = 1
```

### After Adding 3 Todos
```python
todos = {
    1: Todo(id=1, description="Review pull request #42", completed=False),
    2: Todo(id=2, description="Fix authentication bug", completed=True),
    3: Todo(id=3, description="Update documentation", completed=False)
}
next_id = 4
```

### After Deleting Todo #2
```python
todos = {
    1: Todo(id=1, description="Review pull request #42", completed=False),
    3: Todo(id=3, description="Update documentation", completed=False)
}
next_id = 4  # ID 2 is never reused
```

---

## Persistence Model

**Storage**: In-memory only (per spec constraint)
- Data exists only during application runtime
- No file I/O, no databases, no serialization
- All data lost when application terminates
- Users are informed of this limitation

**Future Extension Points** (not implemented in Phase I):
- File-based persistence (JSON, pickle)
- Database integration (SQLite, PostgreSQL)
- Cloud sync APIs

---

## Validation Summary

**At Creation**:
- Description is non-empty (after strip)
- Description length ≤ 200 characters
- ID is auto-assigned (not user-provided)

**At Update**:
- Todo with given ID must exist
- New description meets same validation as creation
- Completed status is preserved

**At Delete**:
- Todo with given ID must exist

**At Query**:
- No validation required (read-only)
- Handle empty list gracefully

---

## Implementation Notes

**Python Implementation**:
```python
from dataclasses import dataclass

@dataclass
class Todo:
    """Represents a single todo item."""
    id: int
    description: str
    completed: bool = False
    
    def __repr__(self) -> str:
        status = "✓" if self.completed else " "
        return f"Todo(id={self.id}, [{status}] {self.description})"
```

**Type Hints**: Full type annotations for all fields and methods  
**Immutability**: `id` should not be changed after creation (enforced by service layer)  
**Thread Safety**: Not required (single-threaded console application)

---

## Success Criteria Mapping

This data model supports:
- **SC-001**: Simple structure enables fast add/view operations
- **SC-002**: Clear CRUD operations on Todo entity
- **SC-003**: No complex state management, reduces crash risk
- **SC-004**: `completed` boolean enables clear visual distinction
- **SC-006**: Dictionary storage handles 50+ todos efficiently (O(1) operations)

All functional requirements (FR-001 to FR-013) are supported by this model.
