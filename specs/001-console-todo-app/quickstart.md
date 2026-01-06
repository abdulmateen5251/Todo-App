# Quickstart Guide: Console Todo Application

**Feature**: 001-console-todo-app  
**Date**: January 7, 2026  
**Audience**: Beginner to intermediate Python developers

## Overview

This quickstart guide helps you set up, run, and verify the console-based todo application. The app is a simple command-line tool for managing todos using in-memory storage.

---

## Prerequisites

- **Python**: Version 3.13 or higher
- **UV**: Package and environment manager
- **Terminal**: Any standard terminal (bash, zsh, PowerShell, cmd)

### Verify Prerequisites

```bash
# Check Python version
python --version
# Expected: Python 3.13.0 or higher

# Check UV is installed
uv --version
# Expected: uv X.Y.Z (any version)
```

### Install Prerequisites (if needed)

**Install Python 3.13+**:
- Linux: `sudo apt install python3.13` or use pyenv
- macOS: `brew install python@3.13` or download from python.org
- Windows: Download from python.org

**Install UV**:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Setup

### 1. Navigate to Project Directory

```bash
cd /path/to/Todo-App
```

### 2. Checkout Feature Branch

```bash
git checkout 001-console-todo-app
```

### 3. Initialize UV Environment

```bash
# Create virtual environment with Python 3.13
uv venv --python 3.13

# Activate virtual environment
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows
```

### 4. Install Dependencies

```bash
# Install development dependencies (pytest for testing)
uv pip install pytest

# No runtime dependencies needed (standard library only)
```

---

## Running the Application

### Basic Usage

```bash
# Run from project root
python main.py
```

Expected output:
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

### Quick Test Workflow

Try this sequence to verify basic functionality:

1. **Add a todo**:
   - Select `1`
   - Enter: `Review pull request #42`
   - Verify success message appears

2. **View todos**:
   - Select `2`
   - Verify todo appears with ID 1 and status `[ ]`

3. **Add two more todos**:
   - Select `1`, enter: `Fix authentication bug`
   - Select `1`, enter: `Update documentation`

4. **Mark one complete**:
   - Select `5`
   - Enter todo ID: `2`
   - Verify success message

5. **View todos again**:
   - Select `2`
   - Verify todo #2 shows `[✓]` status
   - Verify summary shows "2 pending | 1 completed"

6. **Update a todo**:
   - Select `3`
   - Enter todo ID: `1`
   - Enter new description: `Review and merge pull request #42`
   - Verify update confirmation

7. **Delete a todo**:
   - Select `4`
   - Enter todo ID: `2`
   - Confirm with: `yes`
   - Verify deletion message

8. **View final state**:
   - Select `2`
   - Verify only todos #1 and #3 remain

9. **Exit**:
   - Select `6`
   - Verify goodbye message

---

## Running Tests

### Run All Tests

```bash
# From project root
pytest tests/

# With verbose output
pytest -v tests/

# With coverage report
pytest --cov=src tests/
```

Expected output:
```
======================== test session starts ========================
collected 25 items

tests/unit/test_todo_model.py ..........           [ 40%]
tests/unit/test_todo_service.py ............       [ 88%]
tests/integration/test_full_workflow.py ...        [100%]

======================== 25 passed in 0.42s ========================
```

### Run Specific Test Files

```bash
# Unit tests only
pytest tests/unit/

# Integration tests only
pytest tests/integration/

# Specific test file
pytest tests/unit/test_todo_service.py
```

### Run Specific Test Functions

```bash
# Test a specific function
pytest tests/unit/test_todo_service.py::test_add_todo

# Test with pattern matching
pytest -k "test_add"
```

---

## Project Structure

```
Todo-App/
├── main.py                      # Application entry point
├── pyproject.toml               # UV project configuration
├── README.md                    # Project documentation
├── src/
│   ├── models/
│   │   └── todo.py              # Todo data model
│   ├── services/
│   │   └── todo_service.py      # Business logic
│   └── cli/
│       ├── menu.py              # Main menu and interaction loop
│       └── display.py           # Output formatting
└── tests/
    ├── unit/
    │   ├── test_todo_model.py
    │   ├── test_todo_service.py
    │   └── test_cli_display.py
    └── integration/
        └── test_full_workflow.py
```

---

## Common Issues

### Issue: "Command 'python' not found"

**Solution**: Use `python3` instead of `python`:
```bash
python3 main.py
```

### Issue: "ModuleNotFoundError: No module named 'src'"

**Solution**: Ensure you're running from the project root directory:
```bash
pwd  # Should show .../Todo-App
python main.py
```

### Issue: Virtual environment not activated

**Symptoms**: pytest not found or wrong Python version

**Solution**: Activate the virtual environment:
```bash
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows
```

### Issue: Unicode symbols not displaying (✓, ✗, etc.)

**Solution**: This is normal on some terminals. The app falls back to ASCII:
- `✓` → `[X]`
- `✗` → `[!]`

No action needed - functionality is unaffected.

### Issue: Todos disappear after exit

**Expected behavior**: This is by design. The app uses in-memory storage only. All data is lost when the application exits. See [spec.md](spec.md) for details.

---

## Development Workflow

### Making Changes

1. **Edit code** in `src/` directory
2. **Run tests**: `pytest tests/`
3. **Manual test**: `python main.py`
4. **Verify**: All tests pass and manual testing works

### Adding a New Feature

1. Write test first (TDD approach)
2. Implement feature in appropriate module
3. Update CLI if user-facing
4. Run all tests to ensure no regressions
5. Update documentation if needed

### Code Style

- Follow PEP 8 style guide
- Use type hints for all functions
- Write docstrings for public functions
- Keep functions focused (single responsibility)

---

## Success Verification

### Checklist

After setup, verify all of these work:

- [ ] Application starts without errors
- [ ] Can add a new todo
- [ ] Can view all todos
- [ ] Can update a todo description
- [ ] Can delete a todo
- [ ] Can mark a todo as complete
- [ ] Completed todos show different status
- [ ] Can exit gracefully with option 6
- [ ] Keyboard interrupt (Ctrl+C) exits cleanly
- [ ] All tests pass with `pytest tests/`

### Performance Verification

Add 50 todos and verify:
- [ ] Adding todos is instant (<1 second)
- [ ] Viewing all todos is instant
- [ ] All operations remain responsive

---

## Next Steps

- **Read the specification**: See [spec.md](spec.md) for detailed requirements
- **Explore the code**: Start with `main.py` and follow the flow
- **Run tests**: Check `tests/` directory for examples
- **Review contracts**: See `contracts/` for API specifications
- **Read the implementation plan**: See [plan.md](plan.md) for architecture

---

## Getting Help

### Documentation

- **Feature Spec**: [spec.md](spec.md) - What the app should do
- **Implementation Plan**: [plan.md](plan.md) - How it's built
- **Data Model**: [data-model.md](data-model.md) - Data structures
- **Contracts**: `contracts/` - API specifications

### Common Questions

**Q: Can I save my todos to a file?**  
A: Not in Phase I. This is intentionally out of scope. See "Out of Scope" in [spec.md](spec.md).

**Q: Can I add priorities or due dates to todos?**  
A: Not in Phase I. Future phases may add these features.

**Q: Can multiple users share the same todo list?**  
A: No. The app is single-user only with in-memory storage.

**Q: What if I want to export my todos?**  
A: Not supported in Phase I. This is a future enhancement.

---

## Version Information

- **Feature Branch**: 001-console-todo-app
- **Python Version**: 3.13+
- **Dependencies**: Standard library only (pytest for dev)
- **Platform**: Cross-platform (Linux, macOS, Windows)
- **Status**: Active development

Last updated: January 7, 2026
