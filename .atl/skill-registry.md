# Skill Registry — ecommerce
Generated: 2026-04-05 | Project: ecommerce

## Project Conventions
- No project-level CLAUDE.md, agents.md, or .cursorrules found.

## User Skills

| Skill | Trigger |
|-------|---------|
| `react-19` | Writing React components, useMemo/useCallback, Server Components |
| `typescript` | Writing TypeScript — types, interfaces, generics, strict mode |
| `tailwind-4` | Styling with Tailwind — cn(), theme variables, responsive |
| `zod-4` | Zod schema validation (when Zod is added) |
| `branch-pr` | Creating a pull request or preparing changes for review |
| `issue-creation` | Creating GitHub issues, reporting bugs, requesting features |
| `judgment-day` | Adversarial review of completed implementation |
| `skill-creator` | Creating new AI agent skills |
| `go-testing` | Go tests / Bubbletea TUI testing (not applicable here) |

## Compact Rules

### react-19
- No `useMemo`/`useCallback` — React Compiler handles optimization
- Named imports only: `import { useState } from "react"` — never default React import
- `ref` is just a prop — no `forwardRef` needed
- `use()` hook for promises and conditional context
- `useActionState` for form actions with pending state

### typescript
- Const-object pattern: `const STATUS = { ... } as const; type Status = (typeof STATUS)[keyof typeof STATUS]`
- Flat interfaces only — nested objects get their own interface
- Never `any` — use `unknown` + type guard or generics
- `import type { Foo }` for type-only imports

### tailwind-4
- Decision tree: Tailwind class → `className=`, dynamic → `style=`, conditional → `cn()`
- Never `var()` in className — use semantic Tailwind classes
- Never hex colors in className — use Tailwind color classes
- `cn()` only for conditional/conflicting classes — not static ones
- `var()` only for library props that don't accept className (e.g. Recharts)

### branch-pr
- Every PR MUST link an approved issue (`Closes #N`)
- Every PR MUST have exactly one `type:*` label
- Branch naming: `type/description` — e.g. `feat/user-login`, `fix/cart-bug`
- Conventional commits: `type(scope): description`
- No `Co-Authored-By` trailers

### typescript (strict patterns)
- Utility types: `Pick`, `Omit`, `Partial`, `Required`, `Record`, `NonNullable`
- Type guards with `value is T` return type
- Never inline nested objects in interfaces
