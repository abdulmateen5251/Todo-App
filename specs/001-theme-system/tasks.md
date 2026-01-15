# Tasks: Dark & Light Theme System

**Input**: Design documents from `/specs/001-theme-system/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Verify frontend dependencies installed and lockfile updated in frontend/package.json
- [X] T002 Ensure Tailwind and Next.js build scripts run locally (`npm run build`) in frontend/package.json

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T003 Define theme CSS variables for light/dark tokens in frontend/app/globals.css
- [X] T004 Map Tailwind color palette to CSS variables and confirm `darkMode: 'class'` in frontend/tailwind.config.js
- [X] T005 Create shared theme types and exports in frontend/src/types/theme.ts
- [X] T006 Implement theme utility helpers (storage guards, resolution logic) in frontend/src/lib/theme-utils.ts

## Phase 3: User Story 1 - Manual Theme Toggle (Priority: P1) 🎯

**Goal**: User can manually switch themes; preference persists across sessions.
**Independent Test**: Toggle to dark, reload page, dark persists; toggle back to light, persists.

- [X] T007 [US1] Implement ThemeContext with localStorage persistence and manual setTheme in frontend/src/contexts/ThemeContext.tsx
- [X] T008 [US1] Expose useTheme hook for consuming components in frontend/src/hooks/useTheme.ts
- [X] T009 [US1] Create ThemeProvider wrapper component wiring context in frontend/src/components/theme/ThemeProvider.tsx
- [X] T010 [US1] Add ThemeToggle component with sun/moon icons and basic ARIA label in frontend/src/components/theme/ThemeToggle.tsx
- [X] T011 [US1] Apply ThemeProvider at root layout and place toggle in shared header in frontend/app/layout.tsx (and header component if present)
- [X] T012 [US1] Ensure theme class application (`light`/`dark`) on <html> and global surfaces in frontend/app/layout.tsx

## Phase 4: User Story 2 - System Preference Detection (Priority: P2)

**Goal**: Default to system theme and react to OS theme changes without flicker.
**Independent Test**: With no stored preference, app loads matching OS; switching OS theme while in system mode updates UI live; no hydration mismatch on load.

- [X] T013 [US2] Extend ThemeContext to resolve theme via matchMedia `(prefers-color-scheme: dark)` and listen for changes in frontend/src/contexts/ThemeContext.tsx
- [X] T014 [US2] Add pre-hydration blocking script to set initial theme class and prevent FOUC in frontend/app/layout.tsx
- [X] T015 [US2] Default ThemeProvider to `system` when no stored preference and ensure resolvedTheme syncs in frontend/src/components/theme/ThemeProvider.tsx

## Phase 5: User Story 3 - Accessible Theme Controls (Priority: P3)

**Goal**: Theme toggle is fully accessible (keyboard, screen reader, reduced motion).
**Independent Test**: Toggle reachable via Tab, Enter/Space activates, screen reader announces state, respects prefers-reduced-motion.

- [X] T016 [US3] Add robust ARIA/state handling (`aria-pressed`, `aria-label`, optional role="switch") and focus styles in frontend/src/components/theme/ThemeToggle.tsx
- [X] T017 [US3] Honor `prefers-reduced-motion` by disabling non-essential transitions in frontend/app/globals.css
- [X] T018 [US3] Document accessibility behavior and usage in frontend/src/components/theme/ThemeToggle.tsx (comments) and specs/001-theme-system/quickstart.md

## Final Phase: Polish & Cross-Cutting

- [X] T019 [P] Update quickstart and usage notes with any implementation nuances in specs/001-theme-system/quickstart.md
- [X] T020 [P] Manual QA: verify contrast, navigation pages, and persistence across routes in frontend/app/* and frontend/src/components/*
- [X] T021 [P] Add lightweight unit coverage for theme-utils and ThemeContext behaviors in frontend/tests/unit (if time allows)

---

## Dependencies & Execution Order

1) Setup → 2) Foundational → 3) US1 → 4) US2 → 5) US3 → Final Polish
- US1 depends on foundational types/utilities
- US2 depends on US1 Provider/context in place
- US3 depends on US1 (toggle exists) and US2 (system mode behaviors)

## Parallel Execution Examples

- Foundational: T003–T006 can run in parallel (distinct files)
- US1: T008 (hook) and T010 (toggle) can proceed in parallel after T007 (context scaffolding)
- Polish: T019–T021 can run in parallel after all stories complete

## Implementation Strategy

MVP first: finish US1 (manual toggle + persistence) to ship a working theme switch. Then layer US2 (system detection, no-flicker) for seamless defaults, and US3 (accessibility) for compliance. Keep colors in CSS variables for future theme extensions.
