# Hallöchen Website – Agent Instructions

## Project Overview

Hallöchen is a cooperative bar ("Trinkgenossenschaft") in Berlin-Moabit. This is
a full-stack Nuxt 4 application with a Vue 3 frontend and a Nitro/H3 backend,
backed by PostgreSQL via Drizzle ORM. The workspace is a pnpm monorepo.

### Tech Stack

- **Framework:** Nuxt 4 (Vue 3, Nitro server)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4, Tailwind Variants, Tailwind Merge
- **Database:** PostgreSQL, Drizzle ORM, Drizzle Kit for migrations
- **Auth:** nuxt-auth-utils
- **Validation:** Zod
- **Icons:** @heroicons/vue
- **Utilities:** @vueuse/core, @vueuse/gesture, @tanstack/vue-table
- **Complex UI primitives:** Reka UI
- **Package manager:** pnpm

### Directory Structure

```
app/                  # Nuxt app layer (pages, components, layouts, composables)
  components/ui/      # Reusable, styled UI primitives (Button, InputField, etc.)
  components/         # Feature/page-level components
  pages/              # File-based routing
  layouts/            # App layouts (default, internal)
  composables/        # Shared composable functions
  types/              # Frontend-only types
server/               # Nitro server (API routes, database, entities)
  api/                # API route handlers
  entities/           # Domain entities (schema, table, repository, service)
  database/           # Drizzle client and migrations
  middleware/         # Server middleware (auth)
  plugins/            # Server plugins (seed)
shared/               # Code shared between app and server
  types/              # Shared TypeScript interfaces
```

---

## Backend – Clean Code Design

The backend follows a **clean-code, layered architecture**. Each domain entity
lives under `server/entities/<entity>/` with four files:

| File                     | Responsibility                                                        |
| ------------------------ | --------------------------------------------------------------------- |
| `<entity>.schema.ts`     | **Zod schemas** – the single source of truth for validation and types |
| `<entity>.table.ts`      | Drizzle table definition (mirrors the schema for persistence)         |
| `<entity>.repository.ts` | Data-access layer – raw DB queries only, no business logic            |
| `<entity>.service.ts`    | Business logic – orchestrates repositories, enforces rules            |

### Rules

1. **Zod schemas are the main source of truth.** Define all validation, input
   shapes, and derived types in `*.schema.ts`. API handlers must validate
   incoming data against these schemas before passing it to the service layer.
2. **Repositories are thin.** They contain only database queries (select,
   insert, update, delete). No HTTP concerns, no business rules.
3. **Services own business logic.** They call repositories, apply domain rules,
   and enforce authorization (e.g. role checks). Services must **never** throw
   HTTP-specific errors directly. Instead they throw domain error classes (see
   below).
4. **Domain errors over HTTP errors.** Services raise domain-specific error
   classes (e.g. `ForbiddenError`, `NotFoundError`, `ConflictError`). API route
   handlers catch these and map them to the appropriate HTTP responses (status
   codes, messages). This keeps the service layer free of HTTP concerns.
5. **API route handlers stay slim.** Read input, validate with Zod, call the
   service, map domain errors to HTTP responses, return the result.
6. **Shared types** (`shared/types/`) are plain TypeScript interfaces used by
   both frontend and backend. They should stay in sync with the Zod schemas but
   must not import Zod themselves (to keep the shared layer dependency-free).
7. **Repositories are internal to their entity package.** A repository must only
   be imported by its own entity's service. Cross-entity data access goes
   through the other entity's service. This is enforced via ESLint
   (`no-restricted-imports`).

---

## Frontend – Component & Styling Guidelines

### UI Component Library (`app/components/ui/`)

Common, reusable components belong in `app/components/ui/`. These are the
building blocks used across pages and feature components.

- **Use Tailwind Variants (`tv()`)** for styling UI components. Define variant
  props (e.g. `variant`, `color`, `size`) via `tv()` and expose them as
  component props.
- **Only create variants when needed.** Do not add variants speculatively or in
  advance. Add a variant when a second use case requires it.
- **Extract shared styles.** When you notice similar Tailwind classes repeated
  across multiple pages or components, extract them into a new UI component in
  `app/components/ui/`.
- **Use Tailwind Merge (`twMerge`)** when accepting class overrides from
  consumers to avoid conflicting utility classes.

### Reka UI

Use **Reka UI** for complex, stateful UI primitives such as modals, dialogs,
popovers, dropdowns, and similar interactive elements.

- **Always wrap and style Reka UI components** inside `app/components/ui/`.
  Consumers should never import Reka UI primitives directly.
- The wrapper component handles all styling and exposes a simplified,
  project-consistent API.

### General Frontend Rules

- Feature-specific components live directly in `app/components/` (not in `ui/`).
- Composables go in `app/composables/` and follow the `use-<name>.ts` naming
  convention.
- Heroicons is the icon set – import from `@heroicons/vue/24/outline` or
  `@heroicons/vue/24/solid`.
