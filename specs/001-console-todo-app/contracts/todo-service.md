# Service Contract: TodoService

**Feature**: 001-console-todo-app  
**Date**: January 7, 2026  
**Purpose**: Define the interface contract for todo management operations

## Overview

This contract defines the public API for the TodoService, which provides all business logic for CRUD operations on todos. This is an in-process Python API (not REST/HTTP).

---

## Operations

### 1. Add Todo

**Operation**: `add_todo(description: str) -> Todo`

**Purpose**: Create a new todo with the given description

**Input**:
- `description` (str, required): Task description, 1-200 characters

**Output**:
- Returns: `Todo` object with auto-assigned ID and `completed=False`

**Preconditions**:
- Description must be non-empty after stripping whitespace
- Description must not exceed 200 characters

**Postconditions**:
- New todo is stored in collection
- Todo has unique ID
- `completed` is set to False
- Next available ID is incremented

**Errors**:
- `ValueError`: If description is empty or exceeds 200 characters

**Example**:
```python
todo = service.add_todo("Review pull request #42")
# Returns: Todo(id=1, description="Review pull request #42", completed=False)
```

---

### 2. Get All Todos

**Operation**: `get_all_todos() -> list[Todo]`

**Purpose**: Retrieve all todos in the collection

**Input**: None

**Output**:
- Returns: List of all `Todo` objects, ordered by ID (ascending)

**Preconditions**: None

**Postconditions**:
- No state changes
- Returns empty list if no todos exist

**Errors**: None (returns empty list instead of error)

**Example**:
```python
todos = service.get_all_todos()
# Returns: [Todo(id=1, ...), Todo(id=2, ...), Todo(id=3, ...)]
```

---

### 3. Get Todo by ID

**Operation**: `get_todo(todo_id: int) -> Todo`

**Purpose**: Retrieve a specific todo by its ID

**Input**:
- `todo_id` (int, required): The unique identifier of the todo

**Output**:
- Returns: `Todo` object with matching ID

**Preconditions**:
- Todo with given ID must exist

**Postconditions**:
- No state changes

**Errors**:
- `KeyError`: If todo with given ID does not exist

**Example**:
```python
todo = service.get_todo(1)
# Returns: Todo(id=1, description="Review pull request #42", completed=False)
```

---

### 4. Update Todo Description

**Operation**: `update_todo(todo_id: int, new_description: str) -> Todo`

**Purpose**: Update the description of an existing todo

**Input**:
- `todo_id` (int, required): The unique identifier of the todo
- `new_description` (str, required): New task description, 1-200 characters

**Output**:
- Returns: Updated `Todo` object

**Preconditions**:
- Todo with given ID must exist
- New description must be non-empty after stripping
- New description must not exceed 200 characters

**Postconditions**:
- Todo description is updated
- Todo ID remains unchanged (FR-009)
- Completion status remains unchanged (FR-009)

**Errors**:
- `KeyError`: If todo with given ID does not exist
- `ValueError`: If new description is empty or exceeds 200 characters

**Example**:
```python
todo = service.update_todo(1, "Review and merge pull request #42")
# Returns: Todo(id=1, description="Review and merge pull request #42", completed=False)
```

---

### 5. Mark Todo as Complete

**Operation**: `mark_complete(todo_id: int) -> Todo`

**Purpose**: Mark a todo as completed

**Input**:
- `todo_id` (int, required): The unique identifier of the todo

**Output**:
- Returns: Updated `Todo` object with `completed=True`

**Preconditions**:
- Todo with given ID must exist

**Postconditions**:
- Todo `completed` status is set to True
- Todo ID and description remain unchanged
- Idempotent: can be called multiple times without error

**Errors**:
- `KeyError`: If todo with given ID does not exist

**Example**:
```python
todo = service.mark_complete(1)
# Returns: Todo(id=1, description="Review pull request #42", completed=True)
```

---

### 6. Delete Todo

**Operation**: `delete_todo(todo_id: int) -> None`

**Purpose**: Permanently remove a todo from the collection

**Input**:
- `todo_id` (int, required): The unique identifier of the todo

**Output**:
- Returns: None

**Preconditions**:
- Todo with given ID must exist

**Postconditions**:
- Todo is removed from collection
- ID is never reused
- Remaining todos keep their original IDs (no renumbering)

**Errors**:
- `KeyError`: If todo with given ID does not exist

**Example**:
```python
service.delete_todo(2)
# Returns: None (todo #2 is permanently removed)
```

---

### 7. Get Todos by Status

**Operation**: `get_todos_by_status(completed: bool) -> list[Todo]`

**Purpose**: Retrieve todos filtered by completion status

**Input**:
- `completed` (bool, required): True for completed todos, False for pending

**Output**:
- Returns: List of `Todo` objects matching the status, ordered by ID

**Preconditions**: None

**Postconditions**:
- No state changes
- Returns empty list if no matching todos exist

**Errors**: None (returns empty list instead of error)

**Example**:
```python
pending = service.get_todos_by_status(completed=False)
# Returns: [Todo(id=1, completed=False), Todo(id=3, completed=False)]

completed = service.get_todos_by_status(completed=True)
# Returns: [Todo(id=2, completed=True)]
```

---

### 8. Get Todo Counts

**Operation**: `get_counts() -> dict[str, int]`

**Purpose**: Get summary statistics about todos

**Input**: None

**Output**:
- Returns: Dictionary with keys `"total"`, `"pending"`, `"completed"`

**Preconditions**: None

**Postconditions**:
- No state changes

**Errors**: None

**Example**:
```python
counts = service.get_counts()
# Returns: {"total": 3, "pending": 2, "completed": 1}
```

---

## Error Handling

All errors use standard Python exceptions:
- **ValueError**: Invalid input (empty description, too long, invalid type)
- **KeyError**: Todo ID not found

Error messages must be clear and actionable for CLI display.

---

## Type Signatures (Python)

```python
from typing import Protocol
from dataclasses import dataclass

@dataclass
class Todo:
    id: int
    description: str
    completed: bool = False

class TodoServiceProtocol(Protocol):
    def add_todo(self, description: str) -> Todo: ...
    def get_all_todos(self) -> list[Todo]: ...
    def get_todo(self, todo_id: int) -> Todo: ...
    def update_todo(self, todo_id: int, new_description: str) -> Todo: ...
    def mark_complete(self, todo_id: int) -> Todo: ...
    def delete_todo(self, todo_id: int) -> None: ...
    def get_todos_by_status(self, completed: bool) -> list[Todo]: ...
    def get_counts(self) -> dict[str, int]: ...
```

---

## Functional Requirements Mapping

- **FR-001**: Operations map to menu items (add, view via get_all, update, delete, mark_complete)
- **FR-002**: `add_todo` and `update_todo` enforce 200 character limit
- **FR-003**: `id` field provides unique identifiers
- **FR-004**: ValueError raised for empty/invalid descriptions
- **FR-005**: KeyError for non-existent IDs provides basis for clear error messages
- **FR-006**: In-memory dict storage (implementation detail)
- **FR-007**: `completed` field enables status distinction
- **FR-008**: `mark_complete` operation
- **FR-009**: `update_todo` preserves ID and completed status
- **FR-010**: `delete_todo` removes from collection
- **FR-011**: `get_all_todos` provides data for display
- **FR-012**: Clear operation signatures (implementation provides prompts)
- **FR-013**: No special exit operation (handled by CLI layer)

---

## Testing Requirements

Each operation must have:
- Happy path test with valid input
- Error case tests (invalid input, missing todo)
- Edge case tests (empty list, boundary values)
- State verification (postconditions met)

Minimum test coverage: 100% of service operations.
