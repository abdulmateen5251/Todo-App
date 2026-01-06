/sp.constitution

Project: In-Memory Python Console-Based Todo Application

Tech Stack:
- Python
- Claude Code
- Spec-Kit Plus
- In-memory data structures only (no database, no file persistence)

Core principles:
- Simplicity (clear, minimal, beginner-friendly design)
- Correctness (all features behave exactly as specified)
- Determinism (same input always produces same output)
- Readability (clean structure, meaningful naming)

Key standards:
- Console-based interaction only (CLI menus / prompts)
- Data stored in memory using Python lists/dicts
- No external services, APIs, or databases
- Modular code (separate functions for each responsibility)
- Input validation and graceful error handling

Constraints:
- No file I/O, no networking, no web frameworks
- No AI calls during runtime
- Single-process execution
- Runs with standard Python (>=3.9)

Success criteria:
- User can add, view, update, complete, and delete todos
- App runs end-to-end without crashes
- Clear console UX with predictable flow
- Code is easy to extend to future phases (DB, API, AI)
