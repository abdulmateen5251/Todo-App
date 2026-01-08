# Quick Start Guide

## Prerequisites

- Python 3.13 or higher
- UV package manager (optional, for development)

## Installation

### Option 1: With UV (Recommended)

```bash
# Clone and navigate to project
cd Todo-App

# Install dependencies (creates virtual environment)
uv sync

# Run the application
uv run python main.py
```

### Option 2: With Standard Python

```bash
# Clone and navigate to project
cd Todo-App

# Run directly (no dependencies needed)
python3 main.py
```

## Running Tests

```bash
# Run all tests
PYTHONPATH=. uv run pytest tests/ -v

# Run only unit tests
PYTHONPATH=. uv run pytest tests/unit/ -v

# Run integration test
PYTHONPATH=. python3 tests/integration/test_full_workflow.py
```

## Usage

The application provides a simple menu-driven interface:

```
📝 Todo Application

What would you like to do?

  1. Add a new todo
  2. View all todos
  3. Update a todo
  4. Delete a todo
  5. Mark todo as complete
  6. Exit
```

### Example Session

1. **Add a todo**: Select option 1, enter description
2. **View todos**: Select option 2 to see all tasks
3. **Mark complete**: Select option 5, enter todo ID
4. **Update**: Select option 3, enter todo ID and new description
5. **Delete**: Select option 4, enter todo ID, confirm
6. **Exit**: Select option 6 to quit

### Tips

- Todo descriptions must be 1-200 characters
- IDs are auto-assigned starting from 1
- Completed todos show `[✓]`, pending show `[ ]`
- Press Ctrl+C anytime to exit gracefully
- All data is stored in memory (lost on exit)

## Troubleshooting

**"No module named 'src'" error when running tests**
```bash
# Set PYTHONPATH to project root
PYTHONPATH=/path/to/Todo-App uv run pytest tests/
```

**Python version error**
```bash
# Check Python version
python3 --version  # Should be 3.13 or higher
```

**UV not found**
```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Next Steps

See [README.md](README.md) for detailed documentation and [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details.
