# User Interface Contract: CLI Menus and Displays

**Feature**: 001-console-todo-app  
**Date**: January 7, 2026  
**Purpose**: Define the console user interface behavior and output formats

## Overview

This contract specifies how the CLI layer interacts with users, including menu structure, prompts, output formatting, and error messages. All interaction is text-based via stdin/stdout.

---

## Main Menu

### Display Format

```
===========================================
        📝 Todo Application
===========================================

What would you like to do?

  1. Add a new todo
  2. View all todos
  3. Update a todo
  4. Delete a todo
  5. Mark todo as complete
  6. Exit

===========================================
Enter your choice (1-6): _
```

### Behavior

- Display menu before every operation
- Accept integer input 1-6
- Re-display menu after each operation completes
- Loop until user selects option 6 (Exit)

### Error Handling

Invalid input displays:
```
✗ Invalid choice. Please enter a number between 1 and 6.
```

Then re-displays the menu.

---

## Operation 1: Add Todo

### Prompt Sequence

```
Enter your choice (1-6): 1

--- Add New Todo ---
Enter todo description (max 200 characters): _
```

### Success Response

```
✓ Todo added successfully!
  ID: 1
  Description: Review pull request #42
  Status: Pending

Press Enter to continue...
```

### Error Cases

**Empty description:**
```
✗ Error: Description cannot be empty.
Please enter a description: _
```

**Too long (>200 characters):**
```
✗ Error: Description too long (max 200 characters).
Current length: 215
Please enter a shorter description: _
```

---

## Operation 2: View All Todos

### Display Format (with todos)

```
Enter your choice (1-6): 2

==============================================
                Your Todos
==============================================

 ID | Status | Description
----|--------|----------------------------------
  1 | [ ]    | Review pull request #42
  2 | [✓]    | Fix authentication bug
  3 | [ ]    | Update documentation

==============================================
Summary: 3 total | 2 pending | 1 completed
==============================================

Press Enter to continue...
```

### Display Format (empty list)

```
Enter your choice (1-6): 2

==============================================
                Your Todos
==============================================

  You have no todos yet!
  Press 1 from the main menu to add your first todo.

==============================================
Summary: 0 total | 0 pending | 0 completed
==============================================

Press Enter to continue...
```

### Status Indicators

- `[ ]` = Pending todo
- `[✓]` = Completed todo

### Formatting Rules

- Left-align description
- Right-align ID (for consistent column width)
- Truncate descriptions longer than 50 characters with "..." for display
- Always show full description in add/update confirmations

---

## Operation 3: Update Todo

### Prompt Sequence

```
Enter your choice (1-6): 3

--- Update Todo ---
Enter todo ID to update: 1
Current description: Review pull request #42

Enter new description (or press Enter to cancel): _
```

### Success Response

```
✓ Todo #1 updated successfully!
  Old: Review pull request #42
  New: Review and merge pull request #42

Press Enter to continue...
```

### Error Cases

**Todo not found:**
```
✗ Error: Todo #5 not found.
Please check the ID and try again.

Press Enter to continue...
```

**Empty description:**
```
✗ Error: Description cannot be empty.
Update cancelled.

Press Enter to continue...
```

**Cancel (user presses Enter with no input):**
```
Update cancelled.

Press Enter to continue...
```

---

## Operation 4: Delete Todo

### Prompt Sequence

```
Enter your choice (1-6): 4

--- Delete Todo ---
Enter todo ID to delete: 2
Current todo: Fix authentication bug

Are you sure you want to delete this todo? (yes/no): _
```

### Success Response (confirmed)

```
✓ Todo #2 deleted successfully.

Press Enter to continue...
```

### Cancelled

```
Delete cancelled.

Press Enter to continue...
```

### Error Cases

**Todo not found:**
```
✗ Error: Todo #5 not found.
Please check the ID and try again.

Press Enter to continue...
```

---

## Operation 5: Mark Complete

### Prompt Sequence

```
Enter your choice (1-6): 5

--- Mark Todo as Complete ---
Enter todo ID to mark complete: 1
```

### Success Response

```
✓ Todo #1 marked as complete!
  Description: Review pull request #42
  Status: ✓ Completed

Press Enter to continue...
```

### Already Complete (idempotent)

```
ℹ Todo #1 is already marked as complete.

Press Enter to continue...
```

### Error Cases

**Todo not found:**
```
✗ Error: Todo #5 not found.
Please check the ID and try again.

Press Enter to continue...
```

---

## Operation 6: Exit

### Exit Message

```
Enter your choice (1-6): 6

===========================================
     Thank you for using Todo App!
     All todos are stored in memory.
     Your todos will be lost when you exit.
===========================================

Goodbye! 👋
```

Application terminates and returns to console prompt.

---

## General UI Behavior

### Input Handling

- All numeric inputs: Accept integers only, reject non-numeric
- All text inputs: Strip leading/trailing whitespace before validation
- Case sensitivity: "yes"/"YES"/"Yes" all accepted for confirmations
- Empty input: Treated as cancellation where applicable

### Error Message Format

```
✗ Error: [Clear description of what went wrong]
[Optional: What the user should do to fix it]
```

### Success Message Format

```
✓ [Action completed successfully]
  [Optional: Details about what changed]
```

### Info Message Format

```
ℹ [Informational message]
```

### Pagination

Not required for Phase I (assumption: <100 todos per session)

### Unicode Support

- Use Unicode symbols (✓, ✗, ℹ, 👋) where supported
- Fall back to ASCII if Unicode unavailable:
  - `✓` → `[X]`
  - `✗` → `[!]`
  - `ℹ` → `[i]`
  - `👋` → (omit)

### Keyboard Interrupt (Ctrl+C)

```
^C
===========================================
     Exiting Todo App...
     Your todos are stored in memory only.
===========================================

Goodbye! 👋
```

Application terminates gracefully.

---

## Accessibility

- All output is plain text (screen reader compatible)
- Clear visual hierarchy with headers and separators
- Descriptive prompts with examples where helpful
- No color dependencies (works in any terminal)
- Works with monospace and variable-width fonts

---

## User Experience Principles

1. **Clarity**: Every prompt explains what input is expected
2. **Feedback**: Immediate confirmation for every action
3. **Safety**: Confirmation required for destructive actions (delete)
4. **Forgiveness**: Easy to cancel operations
5. **Consistency**: Same patterns for similar operations

---

## Functional Requirements Mapping

- **FR-001**: Main menu presents all 5 operations plus exit
- **FR-002**: Prompts enforce 200 character limit
- **FR-003**: All prompts reference todos by ID
- **FR-004**: Empty input validation with clear error messages
- **FR-005**: Specific error messages for each failure case
- **FR-007**: Status column distinguishes completed vs pending
- **FR-011**: View operation displays ID, description, and status
- **FR-012**: Every operation has clear prompts
- **FR-013**: Exit option with goodbye message

---

## Testing Requirements

Each UI interaction must be testable:
- Input/output capture for automated testing
- Mock stdin for simulating user input
- Verify exact output format strings
- Test all error paths and edge cases
- Verify keyboard interrupt handling
