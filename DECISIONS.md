# Architectural Decisions

Concise log of technology/approach choices made during MVP-0, and why.

## Mobile

**Expo Router (file-based routing)** instead of manually wiring `@react-navigation/bottom-tabs`.
Less boilerplate for a 4-tab app, and it's Expo's current recommended default for new projects.

**Expo SDK 54** (downgraded from the scaffold's default SDK 57).
The test device's Expo Go only supported SDK 54 at the time; not a technical preference, a compatibility constraint.

**Shared `Screen` component wrapping `SafeAreaView`**, with `SafeAreaProvider` mounted once at the root layout, instead of repeating safe-area handling in every screen.
One fix point for a bug that affected all four tabs; new screens get correct behavior for free.

**`EXPO_PUBLIC_API_URL` env var** for talking to the backend, instead of hardcoding `localhost`.
The phone and dev machine are separate devices on Expo Go — `localhost` on the phone would point to the phone itself, not the dev machine.

## Backend

**Express** as the web framework, **plain `pg` client** instead of an ORM (Prisma/Drizzle).
MVP-0's schema is a single table (`clothing_item`); raw SQL is simpler and avoids an extra build step/dependency for a schema this small. Revisit if the schema grows.

**`multer` with disk storage** for image uploads, reading the file back off disk for the AI-detection step rather than keeping it in memory.
Avoids holding image buffers in memory; disk storage is the simpler default for a single-instance MVP backend.

**Centralized JSON error-handling middleware.**
Added after discovering unhandled errors (e.g. multer's file-type rejection) were leaking as HTML stack traces instead of clean JSON the mobile app could parse.

**`docker-compose.yml` for local Postgres** instead of requiring a native Postgres install.
One-command reproducible dev environment (`docker compose up -d`), no host-specific setup docs needed.

## AI / Data

**Local-disk storage stand-in for Supabase Storage, and a random stub instead of a real Gemini vision call for clothing type/color detection.**
No Supabase credentials were available yet; both stand-ins share the same API shape as the real services, so swapping them in later only touches `backend/src/routes/wardrobe.ts` and `backend/src/ai/detectClothing.ts` — no mobile-side changes needed.

**`gemini-flash-latest`** (a model alias, not a pinned dated version) for the stylist chat.
Flash tier is cheaper/faster, appropriate given a small API quota; using the `-latest` alias avoids hardcoding a specific model version that eventually gets deprecated.

**No chat-message persistence table.**
Conversation history is kept client-side (in React state) for the session and replayed to the API per-request. SPEC.md's data model only defines `clothing_item`; adding chat storage wasn't in MVP-0 scope.

## Workflow

**Feature branch + PR per task, no direct pushes to `main`.**
Gives a review checkpoint before code lands, instead of the user only seeing a summary after the fact. Codified in CLAUDE.md.

**GitHub Issues referenced by PRs (`Closes #N`)** for trackable bugs/tasks, alongside TASKS.md as the higher-level MVP-0 checklist.
Matches the original project intent (issues → PRs → done) and gives each unit of work a discussion thread and auto-closing on merge.
