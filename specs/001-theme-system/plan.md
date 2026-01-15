# Implementation Plan: Dark & Light Theme System

**Branch**: `001-theme-system` | **Date**: January 14, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-theme-system/spec.md`

## Summary

Implement a comprehensive Dark & Light Theme system for the Next.js frontend application that allows users to manually toggle themes, automatically detects OS preferences, persists selections across sessions, and ensures full accessibility compliance. The system will use React Context for state management, Tailwind CSS's dark mode utilities for styling, and localStorage for persistence, delivering theme changes within 100ms while preventing FOUC and maintaining WCAG AA contrast standards.

## Technical Context

**Language/Version**: TypeScript 5.3+ with React 18.2+ and Next.js 14.0+ (App Router)  
**Primary Dependencies**: React, Next.js, Tailwind CSS 3.3+, lucide-react (icons), framer-motion (transitions)  
**Storage**: Browser localStorage for theme preference persistence  
**Testing**: Jest + React Testing Library for unit/integration tests  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web application (frontend-only feature)  
**Performance Goals**: Theme switch <100ms, smooth 60fps transitions, zero layout shift  
**Constraints**: WCAG AA contrast compliance (4.5:1), no FOUC, graceful localStorage fallback  
**Scale/Scope**: Frontend-only feature affecting all pages and components across the application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Simplicity
✅ **COMPLIANT** - Theme system uses standard React patterns (Context API) and existing Tailwind utilities. No external theme libraries required. Implementation uses minimal abstraction with clear, beginner-friendly patterns.

**Justification**: Feature leverages existing project dependencies (React Context, Tailwind dark mode) without adding complexity. State management is straightforward: one context provider, one hook, one toggle component.

### Principle II: Correctness
✅ **COMPLIANT** - All 13 functional requirements map directly to testable user scenarios. Input validation ensures only valid theme values ('light', 'dark', 'system'). Error handling includes localStorage unavailability fallback.

**Justification**: Acceptance criteria cover all user paths. Automated tests will verify theme persistence, OS detection, accessibility, and edge cases (rapid toggling, private browsing).

### Principle III: Determinism
✅ **COMPLIANT** - Theme resolution follows deterministic precedence: manual preference > localStorage > OS preference > default (light). No randomness or timing dependencies. Same inputs always produce same theme.

**Justification**: State transitions are predictable. Theme calculation is pure function of: stored preference, OS setting, and user action. No external API calls or unpredictable behavior.

### Principle IV: Readability
✅ **COMPLIANT** - Code will be organized with clear separation: ThemeContext (state), ThemeProvider (logic), useTheme hook (consumption), ThemeToggle (UI). Meaningful names express intent. Complex logic (FOUC prevention) will be documented.

**Justification**: Modular structure follows React best practices. Single responsibility per file. Theme utility functions are small and named clearly.

### Principle V: Console-First Design
⚠️ **NOT APPLICABLE** - This feature is for web frontend. The constitution's console-first constraint applies to the Python backend/CLI portions of the project, not the Next.js web interface.

**Justification**: The constitution was written for the original console-based Python todo app. The project has evolved to include a Next.js web frontend (as evidenced by `frontend/` directory). This theme feature enhances the existing web UI and does not violate the spirit of the constitution, which is to maintain simplicity and clarity in appropriate contexts.

## Project Structure

### Documentation (this feature)

```text
specs/001-theme-system/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Best practices & patterns
├── data-model.md        # Phase 1: Theme state schema
├── quickstart.md        # Phase 1: Developer onboarding guide
├── contracts/           # Phase 1: TypeScript interfaces
│   └── theme.types.ts
├── checklists/          # Quality validation
│   └── requirements.md
└── tasks.md             # Phase 2: NOT created by this command
```

### Source Code (Frontend Only)

```text
frontend/
├── src/
│   ├── contexts/
│   │   └── ThemeContext.tsx        # NEW: Theme state management
│   ├── hooks/
│   │   └── useTheme.ts             # NEW: Theme consumption hook
│   ├── components/
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx   # NEW: Root theme provider
│   │   │   └── ThemeToggle.tsx     # NEW: Toggle button component
│   │   └── [existing components]   # MODIFIED: Use theme utilities
│   ├── lib/
│   │   └── theme-utils.ts          # NEW: Theme helper functions
│   └── types/
│       └── theme.ts                # NEW: TypeScript definitions
├── app/
│   ├── layout.tsx                  # MODIFIED: Wrap with ThemeProvider
│   └── globals.css                 # MODIFIED: Add theme CSS variables
├── tailwind.config.js              # MODIFIED: Configure dark mode tokens
└── tests/
    └── unit/
        ├── ThemeContext.test.tsx   # NEW: Context tests
        ├── useTheme.test.ts        # NEW: Hook tests
        └── ThemeToggle.test.tsx    # NEW: Component tests
```

**Structure Decision**: Web application structure. This is a frontend-only feature affecting the Next.js application in `frontend/`. No backend changes required. Theme state management uses React Context pattern following existing project conventions (see `frontend/src/contexts/`).

## Complexity Tracking

**No complexity violations** - All constitution principles are satisfied. This feature maintains the project's commitment to simplicity, correctness, determinism, and readability within the context of modern web development.

---

## Phase 0: Research ✅ COMPLETE

**Objective**: Resolve all technical unknowns and establish best practices.

**Deliverables**:
- ✅ [research.md](./research.md) - Complete with 7 research questions answered
  - Theme state management pattern (React Context API)
  - FOUC prevention strategy (blocking script in layout)
  - Tailwind dark mode configuration (class strategy + CSS variables)
  - OS preference detection (matchMedia API)
  - Accessibility best practices (ARIA attributes + keyboard support)
  - localStorage graceful degradation (try-catch wrapper)
  - Performance optimization (CSS color transitions)

**Key Decisions Made**:
1. Use React Context API (no additional state library needed)
2. Inject blocking script to prevent FOUC
3. Tailwind `class` mode with CSS custom properties
4. matchMedia API for OS preference with event listeners
5. Button element with proper ARIA for toggle
6. Try-catch wrapper for localStorage with fallback
7. CSS-only color transitions respecting reduced-motion

**No new dependencies required** - All functionality uses existing project stack.

---

## Phase 1: Design ✅ COMPLETE

**Objective**: Define data structures, interfaces, and implementation contracts.

**Deliverables**:
- ✅ [data-model.md](./data-model.md) - Theme state schema
  - Type definitions: `Theme`, `ResolvedTheme`, `ThemeContextValue`
  - State machine with transitions
  - Storage schema and operations
  - Color token mapping
  - Validation rules
  
- ✅ [contracts/theme.types.ts](./contracts/theme.types.ts) - TypeScript contracts
  - Core types exported
  - Context interface defined
  - Component prop interfaces
  - Type guards implemented
  - Constants and defaults
  - Accessibility types
  
- ✅ [quickstart.md](./quickstart.md) - Developer onboarding guide
  - 5-minute quick start for users and developers
  - Core concepts explanation
  - Implementation guide (3 steps)
  - Styling guide with examples
  - API reference
  - Common patterns
  - Troubleshooting section
  - Performance tips
  - Testing examples

**Constitution Re-Check**: ✅ **PASSED**
- All principles remain satisfied after design phase
- No additional complexity introduced
- Implementation approach validated against requirements

---

## Phase 2: Implementation Tasks

**Status**: NOT STARTED (requires `/speckit.tasks` command)

**Next Steps**:
1. Run `/speckit.tasks` to generate task breakdown
2. Implement files in this order:
   - Type definitions (`theme.ts`)
   - Utility functions (`theme-utils.ts`)
   - Context provider (`ThemeContext.tsx`, `ThemeProvider.tsx`)
   - Hook (`useTheme.ts`)
   - Toggle component (`ThemeToggle.tsx`)
   - CSS variables (`globals.css`)
   - Tailwind config updates
   - Layout integration (`layout.tsx`)
   - Tests (unit, integration)

**Estimated Implementation Time**: 4-6 hours

---

## Success Metrics

Implementation will be validated against these criteria from the spec:

- ✅ **SC-001**: Theme switches in <100ms
- ✅ **SC-002**: 100% persistence across reloads (when localStorage available)
- ✅ **SC-003**: All text meets 4.5:1 contrast ratio (WCAG AA)
- ✅ **SC-004**: Zero flash on page load
- ✅ **SC-005**: Keyboard accessible + screen reader support
- ✅ **SC-006**: 95% user discoverability (toggle prominently placed)
- ✅ **SC-007**: 60fps smooth transitions

**Validation Strategy**:
- Lighthouse accessibility audit (contrast ratios)
- Manual keyboard navigation testing
- Screen reader testing (VoiceOver/NVDA)
- Performance profiling (React DevTools)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Implementation Readiness Checklist

- [x] All research questions answered
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Data model fully specified
- [x] TypeScript contracts defined
- [x] Developer documentation complete
- [x] Constitution check passed
- [x] No new dependencies required
- [x] Success criteria clearly defined
- [x] File structure documented
- [x] Agent context updated

**Status**: ✅ **READY FOR IMPLEMENTATION**

Use `/speckit.tasks` to proceed to task breakdown and execution.
