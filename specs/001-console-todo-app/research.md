# Research: In-Memory Python Console-Based Todo Application

**Feature**: 001-console-todo-app  
**Date**: January 7, 2026  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Research Tasks Completed

All technical context was clearly specified in the user requirements. No NEEDS CLARIFICATION markers were present, so this phase focuses on documenting best practices and design patterns for the implementation.

---

## 1. Python Console Application Best Practices

### Decision: Use `input()` for user interaction with comprehensive validation

**Rationale**: 
- Python's built-in `input()` function provides cross-platform console input
- Simple, straightforward, and requires no external dependencies
- Works consistently across Linux, macOS, and Windows terminals
- Supports Unicode by default in Python 3.13+

**Best Practices**:
- Always validate input before processing
- Provide clear prompts with examples
- Handle `KeyboardInterrupt` (Ctrl+C) gracefully
- Strip whitespace from input to avoid user errors
- Use try-except blocks for type conversions

**Alternatives Considered**:
- `sys.stdin.readline()`: More control but unnecessary complexity for this use case
- Third-party libraries (prompt_toolkit, click): Violates "no external dependencies" constraint
- curses library: Too complex for simple menu-driven interface; cross-platform issues on Windows

---

## 2. In-Memory Data Structure Design

### Decision: Use dictionary for Todo storage with auto-incrementing integer IDs

**Rationale**:
- O(1) lookup, insert, and delete by ID
- IDs remain stable when todos are deleted (no renumbering)
- Simple integer IDs are user-friendly for CLI interaction
- Dictionary preserves insertion order in Python 3.7+ (CPython implementation detail made official in 3.7)

**Data Structure**:
```python
# Primary storage
todos: dict[int, Todo] = {}

# ID counter (monotonically increasing)
next_id: int = 1

# Todo structure
@dataclass
class Todo:
    id: int
    description: str
    completed: bool = False
```

**Alternatives Considered**:
- List-based storage: O(n) lookup/delete, requires linear search by ID, IDs must be indices or stored in objects
- Ordered dict: Redundant since Python 3.7+ dicts maintain insertion order
- Custom linked list: Unnecessary complexity, no performance benefit for <100 items

---

## 3. Input Validation Strategy

### Decision: Centralized validation functions with clear error messages

**Rationale**:
- Prevents invalid state from entering the system
- Single source of truth for validation logic
- Easier to test and maintain
- Provides consistent user experience

**Validation Rules**:
- Todo description: Non-empty, stripped of leading/trailing whitespace, max 200 characters per FR-002
- Menu choices: Integer within valid range
- Todo IDs: Must exist in current todo collection
- Empty list operations: Graceful handling with informative messages

**Pattern**:
```python
def validate_description(text: str) -> str:
    """Validate and normalize todo description."""
    cleaned = text.strip()
    if not cleaned:
        raise ValueError("Description cannot be empty")
    if len(cleaned) > 200:
        raise ValueError("Description too long (max 200 characters)")
    return cleaned
```

**Alternatives Considered**:
- Inline validation: Code duplication, harder to test, inconsistent error messages
- Schema validation library (pydantic): External dependency, overkill for simple validation
- Regex-based validation: Unnecessary complexity for simple string checks

---

## 4. CLI Menu Design Pattern

### Decision: Numbered menu with loop-until-exit pattern

**Rationale**:
- Intuitive for users familiar with command-line tools
- Easy to extend with new features
- Clear separation between menu display and action handling
- Supports graceful exit

**Pattern**:
```python
def main_loop():
    while True:
        display_menu()
        choice = get_user_choice()
        
        if choice == 1:
            add_todo()
        elif choice == 2:
            view_todos()
        # ... other options
        elif choice == 6:
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Try again.")
```

**Best Practices**:
- Display menu before every action to remind users of options
- Number options starting from 1 (more intuitive than 0)
- Reserve last option for exit
- Provide clear visual separation (blank lines, headers)

**Alternatives Considered**:
- Command-based interface (like Git): Requires argument parsing, steeper learning curve
- Single-letter commands: Less intuitive, requires documentation
- Nested menus: Unnecessary complexity for 5 operations

---

## 5. Error Handling Strategy

### Decision: Try-except blocks at interaction boundaries with user-friendly messages

**Rationale**:
- Prevents crashes from invalid input
- Provides clear feedback to users
- Maintains application stability
- Follows Python's "easier to ask forgiveness" principle

**Error Handling Layers**:
1. **Input validation**: Catch at data entry point
2. **Business logic**: Validate preconditions (e.g., todo exists)
3. **Top-level**: Catch unexpected errors to prevent crashes

**Pattern**:
```python
def update_todo():
    try:
        todo_id = get_valid_id()
        new_desc = get_valid_description()
        service.update_todo(todo_id, new_desc)
        print(f"✓ Todo #{todo_id} updated successfully")
    except ValueError as e:
        print(f"✗ Error: {e}")
    except KeyError:
        print(f"✗ Todo #{todo_id} not found")
```

**Alternatives Considered**:
- Return codes/tuples: Less Pythonic, verbose, easy to ignore
- Custom exception hierarchy: Overkill for simple application
- No error handling: Violates FR-005 (clear error messages)

---

## 6. Testing Approach

### Decision: pytest with unit tests for services, integration tests for workflows

**Rationale**:
- pytest is the de facto standard for Python testing
- Clear, readable test syntax
- Excellent output and error reporting
- Supports fixtures for test data setup

**Test Strategy**:
- **Unit tests**: Test each service function in isolation (add, update, delete, complete, view)
- **Integration tests**: Test complete user workflows (add → view → complete → view)
- **Edge cases**: Empty list, non-existent IDs, invalid input, boundary conditions
- **No mocking**: Since everything is in-memory, tests run fast without mocks

**Coverage Goals**:
- 100% coverage of service layer
- All acceptance scenarios from spec tested
- All edge cases from spec tested

**Alternatives Considered**:
- unittest: More verbose, class-based structure less concise
- Manual testing only: Not repeatable, doesn't catch regressions
- Property-based testing (hypothesis): Overkill for deterministic CRUD operations

---

## 7. Code Organization Best Practices

### Decision: Layered architecture with clear dependency flow

**Rationale**:
- Models have no dependencies (pure data)
- Services depend only on models
- CLI depends on services and models
- Main depends on CLI
- Unidirectional dependency flow prevents circular imports

**Module Responsibilities**:
- `models/todo.py`: Todo dataclass and TodoList collection manager
- `services/todo_service.py`: CRUD operations, business logic, validation
- `cli/menu.py`: Menu display, user input, main loop
- `cli/display.py`: Output formatting, pretty printing
- `main.py`: Entry point, initializes and runs application

**Design Principles**:
- Single Responsibility: Each module/function does one thing
- Dependency Inversion: CLI depends on abstract operations, not concrete implementation details
- Open/Closed: Easy to add new menu options without modifying existing code

**Alternatives Considered**:
- Single file: Would violate SRP, harder to test, poor readability
- Feature-based organization: Unnecessary for 5 operations
- Three-tier architecture: Too formal for console app

---

## 8. Display Formatting

### Decision: Simple text-based table format with status indicators

**Rationale**:
- Easy to read in any terminal
- No external dependencies (like tabulate or rich)
- Works with monospace and variable-width fonts
- Supports Unicode checkmarks for visual distinction

**Format Example**:
```
=== Your Todos ===

 ID | Status | Description
----|--------|----------------------------------
  1 | [ ]    | Review pull request #42
  2 | [✓]    | Fix authentication bug
  3 | [ ]    | Update documentation

Pending: 2 | Completed: 1 | Total: 3
```

**Status Indicators**:
- `[ ]` for pending todos
- `[✓]` for completed todos
- Alternatively use `PENDING` and `DONE` text for maximum compatibility

**Alternatives Considered**:
- Rich library tables: External dependency, violates constraints
- ASCII art boxes: Cluttered, harder to read
- JSON output: Not user-friendly for CLI interaction
- No formatting: Poor user experience per SC-004

---

## Summary

All technical decisions are finalized with no remaining unknowns:

1. ✅ **User Input**: Python `input()` with validation
2. ✅ **Data Structure**: Dictionary storage with integer IDs
3. ✅ **Validation**: Centralized validation functions
4. ✅ **Menu Design**: Numbered menu with loop-until-exit
5. ✅ **Error Handling**: Try-except at interaction boundaries
6. ✅ **Testing**: pytest with unit + integration tests
7. ✅ **Organization**: Layered architecture (models → services → CLI)
8. ✅ **Display**: Simple text table with status indicators

**Ready for Phase 1**: Data model and contracts definition.
