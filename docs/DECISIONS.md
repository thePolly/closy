# Architectural Decisions

For each choice made during MVP-0: what we picked, what the alternative was, and why — in plain language.

## Mobile

### Routing: Expo Router

**Chosen:** Expo Router (file-based routing — a file's name and folder location decide the screen/route).
**Alternative:** Wire up `@react-navigation/bottom-tabs` by hand (write out the tab list and navigator config yourself).
**Why:** Less code to write for a simple 4-tab app, and it's what Expo currently recommends by default for new projects. Hand-wiring React Navigation is more explicit but is extra setup we don't need yet.

### Expo SDK 54 instead of the newer SDK 57

**Chosen:** SDK 54.
**Alternative:** SDK 57 (what the project started on).
**Why:** Not really a choice — the Expo Go app on the target device only supported SDK 54. SDK 57 and 56 both failed with "incompatible version." Downgraded until the versions matched.

### One shared `Screen` component instead of repeating code per screen

**Chosen:** One `Screen` component (wraps `SafeAreaView`), used by all four tabs.
**Alternative:** Add the safe-area padding separately inside each of the four screen files.
**Why:** The notch/status-bar bug affected all four screens the same way. Fixing it in one shared place means any new screen added later gets it for free, instead of having to remember to add it every time.

### `EXPO_PUBLIC_API_URL` instead of hardcoding the backend address

**Chosen:** An environment variable holding the backend's address (e.g. `http://192.168.1.10:3000`).
**Alternative:** Hardcode `http://localhost:3000` in the code.
**Why:** The phone and the development machine are two different devices. On the phone, "localhost" means the phone itself, not the development machine — so it would never reach the backend. The env var lets this be pointed at the development machine's real network address instead.

## Backend

### Plain `pg` client instead of an ORM (Prisma/Drizzle)

**Chosen:** The `pg` library — SQL is written by hand, and `pg` just sends it to the database and returns the result.
**Alternative:** An ORM like Prisma or Drizzle — code is written in JavaScript/TypeScript (e.g. `db.clothingItem.findMany()`) and the ORM translates it into SQL, plus provides autocomplete and generated types.
**Why:** We only have one table (`clothing_item`). The SQL for it is 3-4 lines — simpler to write by hand than to set up and configure a whole ORM (extra dependency, migration files, code generation). Worth switching to an ORM if the number of tables grows.

### `multer` saving files to disk instead of keeping them in memory

**Chosen:** Save uploaded photos straight to a folder on the server's disk.
**Alternative:** Keep the uploaded file in the server's memory (RAM) instead of writing it to disk.
**Why:** Keeping files in memory only makes sense if they're immediately forwarded somewhere else (like straight to cloud storage). Cloud storage isn't wired up yet, so writing to disk is the simpler, safer default — it won't fill up server memory if several people upload large photos at once.

### One shared error handler instead of handling errors in each route

**Chosen:** A single piece of code at the end of `index.ts` that catches any error from anywhere in the app and always replies with clean JSON (`{"message": "..."}`).
**Alternative:** Add a try/catch block inside every single route file (`wardrobe.ts`, `chat.ts`, etc.) and format the error response there each time.
**Why:** Without this, Express's default behavior is to send back a full HTML page with the raw error and server file paths in it — not something a mobile app can read, and not something that should be shown to a user. One shared handler fixes this everywhere at once instead of having to repeat the same fix in every route file.

## AI / Data

### Local disk + random stub instead of waiting for real Supabase/Gemini access

**Chosen:** Store photos on the backend's local disk, and return a random clothing type/color guess instead of a real AI answer.
**Alternative:** Wait until real Supabase Storage and Gemini API credentials were available before building anything.
**Why:** No credentials were ready yet, but building the rest of the feature didn't need to wait. Both stand-ins were built with the exact same shape as the real thing, so replacing them later only means changing two files — nothing on the mobile app needs to change.

### `gemini-flash-latest` instead of a pinned model version

**Chosen:** The model alias `gemini-flash-latest` (Google always points this at their current fast/cheap model).
**Alternative:** Pin an exact model name/version (e.g. a specific dated model).
**Why:** Flash-tier models are cheaper and faster, which matters given a small API quota. Using the "latest" alias also means we don't have to remember to update the model name later when Google retires an old version.

### No database table for chat history

**Chosen:** Keep the conversation in the phone app's memory only (resets when the app is closed), and send the recent messages along with each new question.
**Alternative:** Save every chat message to the database, so conversations persist between app restarts.
**Why:** The MVP-0 spec only asked for a wardrobe table, not chat history. Adding a whole new table and saving/loading logic for something not yet required would be extra work with no immediate use.

## Workflow

### A branch + pull request for every change, instead of pushing straight to `main`

**Chosen:** Every change gets its own branch, gets pushed, and opens a PR for review before merging.
**Alternative:** Commit and push directly to `main` (what we did at the very start of the project).
**Why:** Direct pushes mean the only way to know what changed is reading a summary after the fact. A PR gives an actual checkpoint to review the real diff before it lands.

### GitHub Issues for trackable bugs/tasks, alongside TASKS.md

**Chosen:** Bugs/tasks that need discussion or tracking get a GitHub Issue; PRs reference it (`Closes #N`) so it closes automatically when merged.
**Alternative:** Track everything only as checkboxes in TASKS.md.
**Why:** TASKS.md is good for the high-level MVP checklist, but a GitHub Issue gives an individual bug or task its own place for discussion and a visible history.
