# In-Memory Python Console-Based Todo Application Constitution

## Core Principles

### I. Simplicity
Every design decision prioritizes clarity and minimalism. All code must be immediately understandable to a beginner programmer. No unnecessary abstractions, no premature optimization, no external dependencies beyond Python standard library. Features are implemented with the fewest moving parts required to work correctly.

### II. Correctness
All features behave exactly as specified in user stories and acceptance criteria. No deviations, no interpretation ambiguity. Thorough input validation prevents invalid state. Error handling is explicit and recoverable. Code is verified through automated tests that cover all user paths.

### III. Determinism
Given identical input, the application always produces identical output. No randomness, no timing dependencies, no external state. In-memory data structures ensure reproducible behavior across all runs. This enables reliable testing and predictable user experience.

### IV. Readability
Code organization is clean and self-documenting. Meaningful names for functions, variables, and modules clearly express intent. Modular structure separates concerns—each function owns one responsibility. Complex logic is broken into named steps. README and inline comments explain non-obvious design choices.

### V. Console-First Design (Non-Negotiable)
All user interaction is text-based: CLI menus, prompts, and formatted output to stdout. No graphical interfaces, no web browsers, no external services. Input comes from user keypresses; output goes to terminal. This constraint ensures accessibility, simplicity, and testability.

## Technical Standards

### Technology Stack
- **Language**: Python 3.13+ (standard library only for data structures)
- **Storage**: In-memory Python lists and dictionaries
- **Interface**: Console CLI only
- **Testing**: Python unittest or pytest
- **No external dependencies**: No databases, APIs, web frameworks, or networking

### Code Organization
Modular structure with clear responsibility separation:
- `src/models/` – Data structures (Todo, TodoList)
- `src/services/` – Business logic (add, update, complete, delete, query)
- `src/cli/` – User interaction (menus, prompts, formatting)
- `tests/` – Unit tests for all services and edge cases

### Non-Negotiable Constraints
- **No file I/O**: All data exists only in current process memory
- **No external calls**: No AI, APIs, databases, or network during runtime
- **Single-process**: Application runs as one linear process
- **Standard Python only**: No pip install required beyond base Python 3.13

## Feature Completeness & Testing

All user stories MUST pass acceptance criteria:
- **Add Todo**: User creates new todo with title, optional description
- **View Todos**: User sees all todos with current status (pending/completed)
- **Update Todo**: User modifies title or description
- **Complete Todo**: User marks todo as done
- **Delete Todo**: User removes todo from list
- **Filter/Query**: User views todos by status
- **Error Handling**: Invalid input gracefully rejects with clear message

All features are covered by unit and integration tests before release. Zero crashes on valid input.

## Governance

### Constitution Authority
This Constitution supersedes all other development practices. All code changes MUST align with the five core principles. When a principle conflicts with convenience, the principle wins.

### Amendment Process
- **Version Numbering**: MAJOR.MINOR.PATCH (semantic versioning)
  - MAJOR: Principle removal or redefinition
  - MINOR: New principle or substantial expansion of guidance
  - PATCH: Clarifications, examples, non-semantic wording improvements
- **Required Documentation**: All amendments include rationale and migration plan
- **Approval**: Technical lead reviews and documents in this file

### Compliance Review
Every code review must verify:
- [ ] Code is modular (single responsibility per function)
- [ ] All user-facing features have acceptance tests
- [ ] Error messages are clear and actionable
- [ ] No external dependencies introduced
- [ ] Functions are named clearly; logic is readable
- [ ] Feature matches specification exactly

### Reference Guidance
See `.specify/templates/plan-template.md`, `.specify/templates/spec-template.md`, and `.specify/templates/tasks-template.md` for detailed feature planning and task organization aligned with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
