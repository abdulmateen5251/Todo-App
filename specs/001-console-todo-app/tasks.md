---
description: "Implementation tasks for In-Memory Python Console-Based Todo Application"
---

# Tasks: In-Memory Python Console-Based Todo Application (Phase I)

**Branch**: `001-console-todo-app`  
**Input**: Design documents from `/specs/001-console-todo-app/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/](contracts/)

**Feature**: Console-based todo application with CRUD operations using in-memory storage.

**Tests**: Not included - tests were not explicitly requested in the feature specification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All file paths are relative to repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure and dependencies

- [X] T001 Create project directory structure (src/, tests/, src/models/, src/services/, src/cli/)
- [X] T002 Initialize UV project with Python 3.13+ in pyproject.toml
- [X] T003 [P] Create main.py application entry point file
- [X] T004 [P] Create README.md with project overview and setup instructions
- [X] T005 [P] Add pytest as dev dependency in pyproject.toml

---

## Phase 2: Foundational (Core Data Model)

**Purpose**: Implement core data structures that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create Todo dataclass in src/models/todo.py with id, description, completed fields
- [X] T007 Create TodoService class skeleton in src/services/todo_service.py with storage dict and next_id counter
- [X] T008 Implement input validation helper function for description (1-200 chars, non-empty) in src/services/todo_service.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add and View Todos (Priority: P1) 🎯 MVP

**Goal**: Enable users to add new todos and view all todos in a list

**Independent Test**: Launch app, add 3-5 tasks with different descriptions, view the list, verify all tasks appear in order

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement add_todo(description) method in src/services/todo_service.py
- [X] T010 [P] [US1] Implement get_all_todos() method in src/services/todo_service.py
- [X] T011 [P] [US1] Implement get_counts() method returning total/pending/completed in src/services/todo_service.py
- [X] T012 [US1] Create display.py with format_todo_list(todos) function in src/cli/display.py
- [X] T013 [US1] Create display.py with format_empty_list() function in src/cli/display.py
- [X] T014 [US1] Create menu.py with display_main_menu() function in src/cli/menu.py
- [X] T015 [US1] Implement get_user_choice() function for menu input in src/cli/menu.py
- [X] T016 [US1] Implement add_todo_flow() function to prompt and call service in src/cli/menu.py
- [X] T017 [US1] Implement view_todos_flow() function to display all todos in src/cli/menu.py
- [X] T018 [US1] Create main application loop in main.py integrating menu and service
- [X] T019 [US1] Add error handling for empty description input in add_todo_flow()
- [X] T020 [US1] Add error handling for invalid menu choices in get_user_choice()

**Checkpoint**: At this point, User Story 1 should be fully functional - users can add and view todos

---

## Phase 4: User Story 5 - Graceful Exit (Priority: P1)

**Goal**: Provide clear exit mechanism for users

**Independent Test**: Perform several operations, select exit option, verify clean termination

### Implementation for User Story 5

- [X] T021 [US5] Implement exit_flow() function with goodbye message in src/cli/menu.py
- [X] T022 [US5] Add exit option (6) to main menu display in display_main_menu()
- [X] T023 [US5] Add exit handling to main loop in main.py to break on option 6
- [X] T024 [US5] Add KeyboardInterrupt (Ctrl+C) handler in main.py with graceful message

**Checkpoint**: MVP complete - users can add, view, and exit. This is the minimum viable product.

---

## Phase 5: User Story 2 - Mark Todos as Complete (Priority: P2)

**Goal**: Allow users to mark tasks as complete to track progress

**Independent Test**: Add 5 tasks, mark 2 as complete, view list, verify completed tasks are visually distinguished

### Implementation for User Story 2

- [X] T025 [P] [US2] Implement mark_complete(todo_id) method in src/services/todo_service.py
- [X] T026 [P] [US2] Implement get_todo(todo_id) helper method in src/services/todo_service.py
- [X] T027 [US2] Update format_todo_list() to show [ ] for pending and [✓] for completed in src/cli/display.py
- [X] T028 [US2] Implement mark_complete_flow() function in src/cli/menu.py
- [X] T029 [US2] Add mark complete option (5) to main menu and main loop
- [X] T030 [US2] Add error handling for non-existent todo ID in mark_complete_flow()
- [X] T031 [US2] Add idempotent handling (info message) if todo already complete in mark_complete_flow()

**Checkpoint**: User Story 2 complete - users can track completed vs pending todos

---

## Phase 6: User Story 3 - Update Todo Descriptions (Priority: P3)

**Goal**: Enable users to edit todo descriptions

**Independent Test**: Create todo with initial text, update to new text, verify updated text appears while preserving ID and status

### Implementation for User Story 3

- [X] T032 [P] [US3] Implement update_todo(todo_id, new_description) method in src/services/todo_service.py
- [X] T033 [US3] Implement update_todo_flow() function in src/cli/menu.py
- [X] T034 [US3] Add update option (3) to main menu and main loop
- [X] T035 [US3] Add error handling for non-existent todo ID in update_todo_flow()
- [X] T036 [US3] Add error handling for empty new description in update_todo_flow()
- [X] T037 [US3] Add cancellation support (empty input) in update_todo_flow()

**Checkpoint**: User Story 3 complete - users can update todo descriptions

---

## Phase 7: User Story 4 - Delete Todos (Priority: P3)

**Goal**: Enable users to remove irrelevant or mistaken todos

**Independent Test**: Add 5 todos, delete 2 specific ones, view list, confirm only 3 remain with original IDs

### Implementation for User Story 4

- [X] T038 [P] [US4] Implement delete_todo(todo_id) method in src/services/todo_service.py
- [X] T039 [US4] Implement delete_todo_flow() function with confirmation prompt in src/cli/menu.py
- [X] T040 [US4] Add delete option (4) to main menu and main loop
- [X] T041 [US4] Add error handling for non-existent todo ID in delete_todo_flow()
- [X] T042 [US4] Add confirmation logic (yes/no) in delete_todo_flow()
- [X] T043 [US4] Add cancellation support in delete_todo_flow()

**Checkpoint**: User Story 4 complete - users can delete todos

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements for production readiness

- [X] T044 [P] Add comprehensive docstrings to all public functions in src/models/todo.py
- [X] T045 [P] Add comprehensive docstrings to all public methods in src/services/todo_service.py
- [X] T046 [P] Add comprehensive docstrings to all functions in src/cli/menu.py and src/cli/display.py
- [X] T047 [P] Add type hints to all function signatures across all modules
- [X] T048 [P] Verify error messages are clear and actionable across all flows
- [X] T049 [P] Test with 50+ todos to verify performance goals (<100ms response)
- [X] T050 [P] Test Unicode characters in todo descriptions
- [X] T051 [P] Test edge case: very long descriptions (200+ characters) get proper error
- [X] T052 [P] Test edge case: operations on empty todo list
- [X] T053 Verify all 13 functional requirements (FR-001 to FR-013) are met
- [X] T054 Run manual acceptance test for all 5 user stories
- [X] T055 Update README.md with usage examples and quickstart guide

---

## Implementation Strategy

### MVP-First Approach

**Minimum Viable Product (MVP)**: Phases 1-4 (Tasks T001-T024)
- Setup + Foundation + User Story 1 (Add/View) + User Story 5 (Exit)
- Delivers core value: capture and view todos
- ~24 tasks, estimated ~300-400 LOC

**Incremental Delivery**:
1. **MVP (Phases 1-4)**: Basic todo capture and viewing
2. **Enhanced (Phase 5)**: Completion tracking
3. **Full Feature (Phases 6-7)**: Edit and delete capabilities
4. **Production Ready (Phase 8)**: Polish and validation

### Parallel Execution Opportunities

**After Foundation Complete (T006-T008)**, these can run in parallel:

**Parallel Group 1 (User Story 1 - Service Layer)**:
- T009: add_todo() method
- T010: get_all_todos() method
- T011: get_counts() method

**Parallel Group 2 (User Story 1 - CLI Layer)**:
- T012: format_todo_list() function
- T013: format_empty_list() function
- T014: display_main_menu() function

**Parallel Group 3 (User Story 2)**:
- T025: mark_complete() method
- T026: get_todo() method

**Parallel Group 4 (User Story 3)**:
- T032: update_todo() method

**Parallel Group 5 (User Story 4)**:
- T038: delete_todo() method

**Parallel Group 6 (Polish Phase)**:
- T044-T052: All documentation and testing tasks (different files)

### Sequential Dependencies

**Must be sequential**:
1. Setup (T001-T005) → Foundation (T006-T008)
2. Foundation → All user stories
3. Service methods → CLI flows that use them
4. CLI flows → Main loop integration
5. All features → Polish phase

---

## Dependencies & Execution Order

### Story Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation)
    ↓
    ├─→ Phase 3 (US1: Add/View) + Phase 4 (US5: Exit) = MVP
    ├─→ Phase 5 (US2: Mark Complete)
    ├─→ Phase 6 (US3: Update)
    ├─→ Phase 7 (US4: Delete)
    ↓
Phase 8 (Polish)
```

### Critical Path

T001 → T002 → T006 → T007 → T008 → T009 → T014 → T015 → T016 → T018 → T021 → T023 → (MVP Complete)

**Estimated MVP Duration**: 24 tasks (assuming 15-30 min per task = 6-12 hours)

### User Story Independence

- **US1 (Add/View)**: Independent, requires only Foundation
- **US5 (Exit)**: Independent, requires only US1 main loop
- **US2 (Mark Complete)**: Depends on US1 (needs view to see status)
- **US3 (Update)**: Independent of US2, requires only Foundation + US1 view
- **US4 (Delete)**: Independent of US2/US3, requires only Foundation + US1 view

**Parallelization**: US2, US3, US4 can be developed simultaneously after US1 is complete

---

## Task Summary

**Total Tasks**: 55  
**Setup & Foundation**: 8 tasks (T001-T008)  
**User Story 1 (P1 - Add/View)**: 12 tasks (T009-T020)  
**User Story 5 (P1 - Exit)**: 4 tasks (T021-T024)  
**User Story 2 (P2 - Mark Complete)**: 7 tasks (T025-T031)  
**User Story 3 (P3 - Update)**: 6 tasks (T032-T037)  
**User Story 4 (P3 - Delete)**: 6 tasks (T038-T043)  
**Polish & Validation**: 12 tasks (T044-T055)  

**Parallelizable Tasks**: 18 tasks marked with [P]  
**MVP Scope**: 24 tasks (Phases 1-4)  
**Estimated LOC**: 500-800 lines

---

## Validation Checklist

Before marking feature complete, verify:

- [X] All 5 user stories have independent test criteria met
- [X] All 13 functional requirements (FR-001 to FR-013) implemented
- [X] All 6 success criteria (SC-001 to SC-006) achieved
- [X] All edge cases from spec.md handled
- [X] Constitution principles maintained (simplicity, correctness, determinism, readability, console-first)
- [X] No external dependencies beyond Python 3.13 standard library
- [X] Application runs without errors on Python 3.13+
- [X] Manual testing of complete user workflows passes
- [X] Code is modular, readable, and well-documented

---

**Generated**: January 7, 2026  
**Completed**: January 7, 2026  
**Status**: ✅ **COMPLETE** - All 55 tasks successfully implemented

**Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md) for complete details.
