# Closy Development Rules

## Project Context

Always read the following documents before starting work:

1. PRODUCT.md
2. SPEC.md
3. TASKS.md

When working on frontend tasks check design/DESIGN.md file for styles.

Implement only the current MVP unless explicitly instructed otherwise.

---

## Development Workflow

Before implementing a feature:

- verify the requirements in SPEC.md
- verify the acceptance criteria
- ask questions if anything is ambiguous

---

## New Building Blocks

Before implementing, list every new building block the change introduces:

- new files, components, functions, or hooks
- new database tables or columns
- new API endpoints

For each one, give its proposed name and a one-line description of what it does.

If a name has reasonable alternatives, present the options and ask before implementing.

Never introduce a new building block silently.

---

## Coding Principles

Prefer simple, modular and maintainable solutions.

Avoid unnecessary complexity.

Do not over-engineer MVP features.

Prefer reusable components.

Use TypeScript strict mode.

---

## AI Collaboration

Act as a senior software engineer.

If a better implementation exists, explain it before making changes.

Do not make architectural decisions silently.

Explain important trade-offs.

---

## Documentation

Document important architectural decisions.

When introducing a new convention or dependency, explain why it is needed.

---

## Completing Tasks

After completing work:

- update TASKS.md
- explain what was implemented
- describe any important architectural decisions

---

## Git

Keep commits small and descriptive.

Each commit should represent one logical change.

Never push directly to `main`. For every task:

- create a feature branch off `main` (e.g. `feat/wardrobe-upload`, `chore/tasks-md-update`)
- commit work to that branch, push the branch
- open a pull request describing only what changed and why in a concise way, referencing the relevant TASKS.md item(s)
- wait for the user to review and merge on GitHub — do not merge automatically, even after approval in chat
- after it's merged, pull the latest `main` locally before starting the next task
