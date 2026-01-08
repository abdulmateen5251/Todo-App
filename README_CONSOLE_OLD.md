# Todo Application

A simple console-based todo application with CRUD operations using in-memory storage.

## Features

- ✅ Add new todos
- ✅ View all todos
- ✅ Update todo descriptions
- ✅ Delete todos
- ✅ Mark todos as complete
- ✅ Clean console interface

## Requirements

- Python 3.13 or higher
- UV package manager (for development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Todo-App
```

2. Install dependencies (if using UV):
```bash
uv sync
```

## Usage

Run the application:
```bash
python main.py
```

Or with UV:
```bash
uv run main.py
```

### Main Menu Options

1. **Add a new todo** - Create a new task (max 200 characters)
2. **View all todos** - Display all todos with status indicators
3. **Update a todo** - Edit an existing todo's description
4. **Delete a todo** - Permanently remove a todo
5. **Mark todo as complete** - Mark a task as done
6. **Exit** - Close the application

### Status Indicators

- `[ ]` - Pending todo
- `[✓]` - Completed todo

## Development

Run tests:
```bash
uv run pytest
```

## Project Structure

```
Todo-App/
├── src/
│   ├── models/          # Data structures (Todo dataclass)
│   ├── services/        # Business logic (TodoService)
│   └── cli/            # Console interface (menu, display)
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── main.py             # Application entry point
└── pyproject.toml      # Project configuration
```

## Important Notes

- **In-Memory Storage**: All todos are stored in memory only. Data is lost when the application exits.
- **No Persistence**: This is Phase I - no file or database storage is included.
- **Single User**: Designed for single-user, single-session use.

## Technical Details

- **Language**: Python 3.13+
- **Dependencies**: Python standard library only (no external runtime dependencies)
- **Architecture**: Three-layer design (models, services, CLI)
- **Performance**: Optimized for <100ms response time with up to 50 todos

## License

See LICENSE file for details.
