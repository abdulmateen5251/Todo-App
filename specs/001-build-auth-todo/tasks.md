# Tasks: Authenticated Web-Based Todo Application

**Feature**: 001-build-auth-todo  
**Status**: Ready for Implementation  
**Generated**: 2026-01-07  
**Phase**: 2 – Implementation Tasks  

---

## Overview

This tasks.md organizes implementation work into **6 phases**:
1. **Phase 1 (Setup)**: Project initialization for backend + frontend
2. **Phase 2 (Foundational)**: Shared infrastructure (DB, auth, testing setup)
3. **Phase 3 (US1)**: Secure personal workspace (auth + view/create tasks)
4. **Phase 4 (US2)**: Task lifecycle management (edit/complete/delete)
5. **Phase 5 (US3)**: Responsive, resilient experience (error handling + UI polish)
6. **Phase 6 (Polish)**: Cross-cutting concerns, deployment, security hardening

Each user story phase is **independently testable** and includes its own acceptance tests.

---

## Phase 1: Project Setup

### Dependencies
None – this is the first phase.

### Phase Goal
Initialize backend and frontend project structures, configure environments, and establish baseline dependencies.

### Implementation Tasks

- [X] T001 Create backend project structure with FastAPI, SQLModel, and Neon dependencies in `backend/src/`
- [X] T002 Create frontend project structure with Next.js 16+, Tailwind CSS, and Better Auth in `frontend/`
- [X] T003 [P] Set up Python virtual environment and install backend dependencies (FastAPI, SQLModel, psycopg2, alembic, pytest)
- [X] T004 [P] Initialize Node.js project for frontend with package.json and install core dependencies (next, react, next-auth, tailwindcss)
- [X] T005 Configure environment files (.env.local for frontend, .env for backend) with placeholder values
- [X] T006 Set up git branching strategy and add .gitignore for both backend and frontend
- [ ] T007 [P] Initialize Neon PostgreSQL project and create a development database
- [X] T008 Create root-level documentation linking to plan.md, spec.md, and quickstart.md

### Acceptance Criteria
- Backend and frontend directories exist with correct folder structure
- All dependencies are installed and can be imported
- Environment files are created and valid (no missing required keys)
- Database connection string is available in backend .env

### Test Criteria (Setup Phase)
Not applicable – setup is verified by artifact existence and dependency resolution.

---

## Phase 2: Foundational Infrastructure

### Dependencies
Requires: Phase 1 (Setup)

### Phase Goal
Set up database schema, authentication middleware, and testing infrastructure as shared prerequisites for all user stories.

### Implementation Tasks

- [X] T009 [P] Define SQLModel Task entity in `backend/src/models/task.py` with fields: id, user_id, description, completed, due_date, created_at, updated_at
- [X] T010 [P] Define SQLModel User entity in `backend/src/models/user.py` with fields: id, email, name, created_at
- [X] T011 Create Alembic migration setup in `backend/alembic/` with initial migration to create tasks and users tables in Neon
- [X] T012 [P] Implement Better Auth token validation dependency in `backend/src/auth/dependencies.py` with validate_token() function
- [X] T013 Create FastAPI app initialization in `backend/src/main.py` with CORS, exception handlers, and health check endpoint
- [X] T014 [P] Set up database session management in `backend/src/db/session.py` with Neon connection pooling
- [X] T015 Create request/response schemas in `backend/src/schemas/task.py` (TaskCreate, TaskUpdate, TaskResponse)
- [X] T016 [P] Configure Next.js app layout in `frontend/app/layout.tsx` with SessionProvider and auth initialization
- [ ] T017 Set up NextAuth/Better Auth route handler in `frontend/app/api/auth/[...nextauth]/route.ts`
- [X] T018 [P] Create TypeScript types in `frontend/src/types/task.ts` matching backend Task schema
- [X] T019 Create API client in `frontend/src/services/api.ts` with fetch wrapper and token injection
- [X] T020 [P] Create useTasks React hook in `frontend/src/hooks/useTasks.ts` for state management and API integration
- [X] T021 Set up pytest fixtures and conftest.py in `backend/tests/conftest.py` for unit and integration tests
- [X] T022 [P] Create test database initialization script for CI/CD environments

### Acceptance Criteria
- SQLModel entities compile without errors
- Alembic migration creates tables in Neon successfully
- Better Auth token validation correctly extracts user_id from valid tokens
- FastAPI app starts without errors on http://localhost:8000
- NextAuth integration works and session can be mocked in tests
- API client TypeScript types match backend schemas

### Test Criteria (Foundational Phase)
- [ ] **Unit Test**: Validate token extraction from JWT claims
- [ ] **Unit Test**: Test SQLModel Task and User entity construction
- [ ] **Integration Test**: Verify Neon connection and table creation
- [ ] **Integration Test**: Mock NextAuth session and verify context availability

---

## Phase 3: User Story 1 – Secure Personal Workspace

**User Story**: A signed-in user must see only their todos, add tasks, and trust that they persist between sessions.

**Priority**: P1 (Core feature unlocking all others)

### Dependencies
Requires: Phase 2 (Foundational Infrastructure)

### Phase Goal
Implement authentication enforcement, task listing, and task creation with user-scoped data isolation.

### Implementation Tasks

- [X] T023 [US1] [P] Implement GET /api/{user_id}/tasks endpoint in `backend/src/api/tasks.py` with token validation and user ID matching
- [X] T024 [US1] [P] Implement POST /api/{user_id}/tasks endpoint for creating tasks with description and optional due_date
- [X] T025 [US1] Add authentication check to protected pages in `frontend/app/page.tsx` (redirect to login if not authenticated)
- [X] T026 [US1] [P] Create TaskList React component in `frontend/src/components/TaskList.tsx` displaying tasks from API
- [X] T027 [US1] [P] Create TaskForm React component in `frontend/src/components/TaskForm.tsx` for adding new tasks
- [X] T028 [US1] Implement task creation handler in useTasks hook to POST to `/api/{user_id}/tasks`
- [X] T029 [US1] [P] Add error handling in TaskList and TaskForm with user-friendly messages
- [X] T030 [US1] Render task list on dashboard with pending/completed status badge for each task
- [X] T031 [US1] [P] Implement database indexes on user_id and completed columns for query performance
- [X] T032 [US1] Add request/response logging for GET and POST endpoints (useful for debugging auth flow)

### Acceptance Criteria
- User can sign in via Better Auth
- Authenticated user sees only their tasks via GET /api/{user_id}/tasks
- Task creation form works and new tasks appear in the list immediately
- Tasks persist after page refresh (proof of Neon persistence)
- Unauthenticated requests return 401 Unauthorized
- Cross-user requests (wrong user_id in path) return 403 Forbidden
- Pagination works correctly for users with >100 tasks

### Test Criteria (User Story 1)
- [ ] **Integration Test**: Sign in, POST new task, GET tasks list, verify new task is present
- [ ] **Integration Test**: Create task as User A, attempt GET as User B, verify 403 Forbidden
- [ ] **Integration Test**: Sign out, sign back in, verify tasks still present
- [ ] **Unit Test**: TaskForm component renders and calls onSubmit with valid input
- [ ] **Unit Test**: TaskList component renders task items with correct badges
- [ ] **Contract Test**: GET /api/{user_id}/tasks returns status 200 with Task[] array
- [ ] **Contract Test**: POST /api/{user_id}/tasks with valid body returns 201 with Task object

### End-to-End Test Scenario (US1)
1. User visits app homepage
2. Redirected to Better Auth login page
3. User signs in with test credentials
4. Dashboard loads and shows "You have 0 tasks"
5. User fills out form: "Buy groceries"
6. Task appears in list with "pending" badge
7. User refreshes page
8. Task still appears (Neon persistence verified)
9. User signs out
10. User signs back in
11. Task is still there

---

## Phase 4: User Story 2 – Task Lifecycle Management

**User Story**: Alice can edit, complete, or delete a task without leaving her authenticated workspace so the list stays actionable.

**Priority**: P2 (Converts static list into actionable workflow)

### Dependencies
Requires: Phase 3 (US1 – Secure Personal Workspace)

### Phase Goal
Implement PUT, PATCH, and DELETE endpoints; build edit controls and task toggles in the UI.

### Implementation Tasks

- [X] T033 [US2] [P] Implement PUT /api/{user_id}/tasks/{task_id} endpoint for editing description and due_date
- [X] T034 [US2] [P] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint for toggling completion
- [X] T035 [US2] [P] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint with proper user validation
- [X] T036 [US2] [P] Create TaskItem React component in `frontend/src/components/TaskItem.tsx` with edit/delete/complete buttons
- [X] T037 [US2] Create edit form modal or inline editor for updating task description in `frontend/src/components/TaskEditForm.tsx`
- [X] T038 [US2] [P] Add toggle handler in useTasks hook for PATCH /complete endpoint
- [X] T039 [US2] Implement delete handler in useTasks hook with confirmation dialog before DELETE
- [X] T040 [US2] [P] Implement update handler in useTasks hook for PUT endpoint with optimistic UI updates
- [X] T041 [US2] Add visual indicators (checkboxes, strikethrough) for completed tasks in TaskItem
- [X] T042 [US2] [P] Implement conflict detection for simultaneous edits (basic: warn if updated_at has changed)
- [X] T043 [US2] Add toast notifications or inline messages for success/failure of edit/delete/complete actions
- [X] T044 [US2] [P] Ensure deleted tasks are removed from UI immediately (or show undo for 5 seconds)

### Acceptance Criteria
- Edit task description and verify changes persist via GET /api/{user_id}/tasks/{task_id}
- Toggle task completion status; completed tasks show visual indicator (strikethrough)
- Delete task; it no longer appears in list
- All three operations (edit/toggle/delete) work without page refresh
- Error messages are clear if operations fail (e.g., 404 if task not found)
- Concurrent edits by same user show latest version without duplication

### Test Criteria (User Story 2)
- [ ] **Integration Test**: Create task, edit description, GET task, verify new description
- [ ] **Integration Test**: Create task, PATCH /complete, verify completed=true
- [ ] **Integration Test**: Create task, DELETE, GET list, verify task is gone
- [ ] **Unit Test**: TaskItem component renders with edit/delete/complete buttons
- [ ] **Unit Test**: TaskEditForm component submits update and calls onSave
- [ ] **Contract Test**: PUT /api/{user_id}/tasks/{task_id} returns 200 with updated Task
- [ ] **Contract Test**: PATCH /api/{user_id}/tasks/{task_id}/complete returns 200 with Task, completed flag toggled
- [ ] **Contract Test**: DELETE /api/{user_id}/tasks/{task_id} returns 204 No Content

### End-to-End Test Scenario (US2)
1. User has 1 pending task: "Buy groceries"
2. User clicks edit button
3. Modal appears with current description
4. User changes to "Buy groceries and cook dinner"
5. User clicks save
6. Task updates in list immediately (no refresh needed)
7. User clicks checkbox to toggle completion
8. Task shows "completed" badge with strikethrough text
9. User clicks delete button
10. Confirmation dialog appears
11. User confirms delete
12. Task disappears from list
13. User refreshes page
14. No tasks appear (deletion persisted)

---

## Phase 5: User Story 3 – Responsive, Resilient Experience

**User Story**: Alice receives clear feedback when errors occur and a responsive layout on both desktop and mobile viewports.

**Priority**: P3 (Polish: error handling, responsive design, edge cases)

### Dependencies
Requires: Phase 4 (US2 – Task Lifecycle Management)

### Phase Goal
Implement comprehensive error handling, network resilience, responsive UI, and edge case handling.

### Implementation Tasks

- [X] T045 [US3] [P] Create error boundary component in `frontend/src/components/ErrorBoundary.tsx` for catching React errors
- [X] T046 [US3] [P] Implement retry logic in API client for transient failures (exponential backoff, max 3 retries)
- [X] T047 [US3] Create error toast/alert component in `frontend/src/components/ErrorAlert.tsx` for displaying error messages
- [X] T048 [US3] [P] Add network status indicator (online/offline) in header
- [X] T049 [US3] Implement input validation on TaskForm (required fields, max length 200 chars)
- [X] T050 [US3] [P] Add server-side validation response parsing and display field-level errors
- [X] T050 [US3] Create token expiry handling: detect 401 responses and prompt re-authentication
- [X] T051 [US3] [P] Implement token refresh logic before making requests (or catch expired token and retry)
- [X] T052 [US3] Build responsive layout using Tailwind CSS breakpoints (sm, md, lg, xl) for mobile/tablet/desktop
- [X] T053 [US3] [P] Test layout on viewports: 360px (mobile), 768px (tablet), 1440px (desktop)
- [X] T054 [US3] Ensure accessible touch targets (min 44px) on mobile for buttons and checkboxes
- [X] T055 [US3] [P] Add loading states (spinners, disabled buttons) during API calls
- [X] T056 [US3] Create skeleton loaders for task list while fetching data
- [X] T057 [US3] [P] Implement optimistic updates: show changes immediately, revert if API fails
- [X] T058 [US3] Add logging/monitoring for API errors (log to console in dev, Sentry in prod)
- [X] T059 [US3] [P] Handle edge cases: empty task list, very long descriptions, special characters in input
- [X] T060 [US3] Test Neon connection failure scenarios and display appropriate user message

### Acceptance Criteria
- Network errors display user-friendly messages (not stack traces)
- Failed API calls show retry button; retrying succeeds if service recovers
- Expired tokens trigger re-authentication flow; last action is retried automatically
- Layout has no horizontal scroll on 360px–1440px viewports
- Touch targets on mobile are ≥44px for accessibility
- Loading states show spinners and disabled buttons during pending operations
- Empty state message shown when user has no tasks
- Special characters (emojis, quotes, etc.) in task descriptions are handled safely
- Neon connection errors show "Service temporarily unavailable" message

### Test Criteria (User Story 3)
- [ ] **Integration Test**: Simulate API timeout, verify retry logic succeeds on second attempt
- [ ] **Integration Test**: Receive 401 Unauthorized, verify re-auth prompt, verify action is retried
- [ ] **Unit Test**: ErrorBoundary catches React error and displays fallback UI
- [ ] **Unit Test**: ErrorAlert component renders with icon, message, and close button
- [ ] **Responsive Test**: Verify no horizontal scroll at 360px, 768px, 1440px viewports
- [ ] **Accessibility Test**: Touch targets are ≥44px on mobile
- [ ] **Unit Test**: Loading spinner appears during API call
- [ ] **Unit Test**: Empty state message renders when task list is empty
- [ ] **Contract Test**: API returns error response with code, message, and optional details

### End-to-End Test Scenario (US3 – Happy Path)
1. User views dashboard on iPhone (360px viewport)
2. Task list is visible without horizontal scroll
3. User adds a new task: "Learn React ✨"
4. Spinner shows during submission
5. Task appears with emoji preserved
6. User navigates to tablet view (768px) – layout adapts, no scroll
7. User returns to desktop view (1440px) – layout is spacious
8. Touch targets (checkbox, delete button) are clearly clickable on mobile

### End-to-End Test Scenario (US3 – Error Case)
1. User attempts to create task while network is down
2. Error message appears: "Unable to connect. Please check your internet."
3. Retry button is available
4. User regains internet connection
5. User clicks Retry
6. Task is created successfully
7. Error message dismisses

---

## Phase 6: Polish & Cross-Cutting Concerns

### Dependencies
Requires: Phase 5 (US3 – Responsive, Resilient Experience)

### Phase Goal
Finalize testing, security hardening, performance optimization, and deployment readiness.

### Implementation Tasks

- [X] T061 [P] Write comprehensive integration test suite covering all three user stories in `backend/tests/integration/test_todo_flow.py`
- [X] T062 [P] Write backend unit tests for Task model validation, auth dependency, and error handling in `backend/tests/unit/`
- [ ] T063 Write frontend component tests for TaskList, TaskForm, TaskItem in `frontend/__tests__/components/`
- [ ] T064 [P] Write end-to-end tests using Playwright or Cypress covering full user workflows in `frontend/tests/e2e/`
- [X] T065 [P] Add request validation for all API endpoints (Pydantic schemas validate input)
- [X] T066 Set up security headers in FastAPI (X-Frame-Options, X-Content-Type-Options, etc.)
- [X] T067 [P] Implement rate limiting on API endpoints (if time permits; can be deferred to Phase 3)
- [X] T068 Add comprehensive logging to FastAPI endpoints (all requests/responses)
- [X] T069 [P] Add API documentation (FastAPI auto-generates OpenAPI/Swagger at /docs)
- [X] T070 [P] Performance optimization: add caching headers, database indexes (indexes done in T031)
- [X] T071 Prepare deployment documentation in `DEPLOYMENT.md` (environment vars, database setup, secrets)
- [X] T072 [P] Set up CI/CD pipeline (GitHub Actions) to run tests on every push
- [X] T073 Create production deployment checklist (Vercel for frontend, cloud provider for backend)
- [ ] T074 [P] Add monitoring/alerting setup (e.g., Sentry for error tracking)
- [X] T075 Document API usage in README.md with examples and troubleshooting
- [X] T076 [P] Conduct security review: verify no secrets in code, token validation, CORS config

### Acceptance Criteria
- All tests pass (unit, integration, e2e)
- Test coverage ≥80% for critical paths (auth, CRUD)
- API documentation is auto-generated and accessible
- Security headers are present in all responses
- No database queries N+1 (verified via logging)
- Deployment documentation is complete and tested
- CI/CD pipeline runs successfully on feature branch

### Test Criteria (Polish Phase)
- [ ] **Test Coverage**: Backend ≥80% coverage (core auth, task CRUD)
- [ ] **Test Coverage**: Frontend ≥70% coverage (components, hooks)
- [ ] **End-to-End**: Full user workflow (sign in → create → edit → complete → delete → sign out)
- [ ] **Security Test**: Verify cross-user isolation (User A cannot access User B's tasks)
- [ ] **Performance Test**: 20 sequential CRUD actions complete in <1.2s p95

### Final Deliverables
- [X] T077 Create IMPLEMENTATION_SUMMARY.md documenting what was built and next steps
- [ ] T078 [P] Verify all source code is committed to feature branch `001-build-auth-todo`
- [ ] T079 Create pull request with link to spec.md, plan.md, and test results

---

## Dependency Graph & Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational Infrastructure)
    ↓
Phase 3 (US1: Secure Personal Workspace) [P1]
    ↓
Phase 4 (US2: Task Lifecycle Management) [P2]
    ↓
Phase 5 (US3: Responsive, Resilient Experience) [P3]
    ↓
Phase 6 (Polish & Cross-Cutting Concerns)
```

**Sequential Completion**: Each phase unblocks the next. However, within each phase, parallelizable tasks (marked [P]) can run concurrently.

---

## Parallel Execution Examples

### Within Phase 1 (Setup)
```
T001, T002 (project structure)
    ↓
T003, T004, T005, T006 (in parallel)
    ↓
T007 (Neon setup)
    ↓
T008 (documentation)
```

### Within Phase 2 (Foundational Infrastructure)
```
T009, T010 (models) [P]
T012 (auth dependency) [P]
T018 (frontend types) [P]
    ↓
T011 (migrations) [depends on T009, T010]
T013 (FastAPI app) [depends on T009, T010, T012]
T014, T019, T020, T021 (parallel) [P]
```

### Within Phase 3 (US1)
```
T023, T024 (backend endpoints) [P]
T026, T027 (frontend components) [P]
    ↓
T025, T028, T029, T030, T031, T032 (integration tasks)
```

### Within Phase 4 (US2)
```
T033, T034, T035 (backend endpoints) [P]
T036, T037 (frontend components) [P]
    ↓
T038, T039, T040, T041, T042, T043, T044 (UI/UX integration)
```

### Within Phase 5 (US3)
```
T045, T046, T047, T048, T049, T050, T051, T052, T053, T054 (error/responsive) [P]
    ↓
T055, T056, T057, T058, T059, T060 (polish)
```

---

## MVP Scope Recommendation

**Minimum Viable Product (MVP)**: Phases 1–4

- Phase 1: Project setup ✓
- Phase 2: Foundational infrastructure ✓
- Phase 3: Secure personal workspace (US1 – P1) ✓
- Phase 4: Task lifecycle management (US2 – P2) ✓

This delivers the core feature: **authenticated, multi-user task management with full CRUD**.

**Phase 5 (US3)** and **Phase 6 (Polish)** are enhancements for production readiness and polish.

---

## Success Metrics (from spec.md)

| Metric | Target | Verification |
|--------|--------|--------------|
| **SC-001** | 95% of responses <1.2s p95 | Run load test with 20 sequential actions |
| **SC-002** | Security tests verify no cross-user access | Integration test: User A cannot access User B's tasks |
| **SC-003** | UI updates <1s after API response; no horizontal scroll 360–1440px | E2E test + responsive test suite |
| **SC-004** | Tasks persist after sign out/in | E2E test: sign out, sign back in, verify data |

---

## Notes for Implementation

### Backend Development Tips
1. Use FastAPI's dependency injection (`Depends()`) extensively for auth, DB session, etc.
2. Leverage SQLModel's dual Pydantic + ORM features to minimize schema duplication.
3. Use Alembic for database migrations; version control schema changes.
4. Log all 4xx/5xx errors for debugging; use structured logging (JSON format for easy parsing).

### Frontend Development Tips
1. Use React hooks (`useTasks`) for API state management; consider SWR or React Query for caching.
2. Build components to be testable: accept props for data and callbacks, avoid hardcoded API calls.
3. Use Tailwind CSS utility classes for styling; leverage breakpoints for responsive design.
4. Test components in isolation with mocked API responses.

### Testing Tips
1. Unit tests: Fast, isolated, mock external dependencies (DB, API).
2. Integration tests: Use a test database (Neon test project or SQLite); verify end-to-end flow.
3. E2E tests: Use Playwright/Cypress; run against staging environment if possible.
4. Always test the unhappy path (errors, edge cases, concurrency).

---

## Summary

This tasks.md defines **79 actionable implementation tasks** organized into **6 phases**:

| Phase | Goal | Tasks | Duration |
|-------|------|-------|----------|
| 1 | Setup | T001–T008 (8) | ~2–3 hours |
| 2 | Foundational | T009–T022 (14) | ~4–5 hours |
| 3 | US1 (P1) | T023–T032 (10) | ~3–4 hours |
| 4 | US2 (P2) | T033–T044 (12) | ~4–5 hours |
| 5 | US3 (P3) | T045–T060 (16) | ~5–6 hours |
| 6 | Polish | T061–T079 (19) | ~6–8 hours |

**Total**: ~25–31 hours of focused development (parallelizable work can reduce actual calendar time).

**MVP scope** (Phases 1–4): ~13–17 hours to deliver core feature.

Each task is specific, actionable, and includes acceptance criteria. Use this file as your daily checklist for implementation. ✓
