# Closy MVP-2

**Version:** 0.3

**Status:** Ready for Development

---

# Goal

Turn the wardrobe from a labeled collection into an organized, personal space.

Every item gets a clear name, users can find items by filtering and sorting, and the app is personalized with the user's name — all without adding Gemini API cost beyond the existing one-call-per-upload analysis.

---

# Feature 1 — Settings & Profile

## Description

The Settings screen lets the user set their name. The name personalizes the Home greeting and is stored locally on the device.

---

## Requirements

- The Settings screen has a name input.
- The name persists on the device across app restarts (local storage).
- The Home greeting shows the name when set (e.g. "Good morning, Polina!") and falls back to the generic greeting when empty (e.g. "Good morning!").
- The user can edit or clear the name.

---

## Out of Scope

- Authentication, user accounts, and syncing the name across devices.

---

## Acceptance Criteria

- Entering a name and reopening the app shows the same name.
- The Home greeting reflects the current name.
- Clearing the name reverts to the generic greeting.

---

# Feature 2 — AI Item Naming

## Description

Each analyzed clothing item gets a short, descriptive AI-generated name. The name comes from the **existing** clothing-analysis Gemini call — no additional API request is made.

Users can rename any item. Identical items are disambiguated with numbers.

---

## Requirements

- The clothing analysis returns a short descriptive name (e.g. "White T-Shirt", "Oversized Blue Jeans") as part of the same Gemini call already made on upload.
- If a generated name matches an existing item's name, the new item's name is numbered: the first keeps the plain name ("White T-Shirt"), the next becomes "White T-Shirt 2", and so on.
- The name is shown on the wardrobe grid cards and on the details screen.
- The user can edit an item's name on the details screen; the edited name persists.
- A failed item has no name until analysis succeeds; the name is generated when analysis is retried.

---

## Acceptance Criteria

- A new upload receives a sensible name automatically.
- Two identical items receive distinct, numbered names.
- Editing a name persists and is reflected on both the grid and the details screen.
- No Gemini calls are made beyond the existing one-per-upload analysis.

---

# Feature 3 — Wardrobe Filtering & Sorting

## Description

Users can filter and sort the wardrobe grid using the metadata already extracted in MVP-1. No new API calls are involved.

---

## Requirements

- Filter the grid by clothing type, season, style, and color.
- Sort by newest (default) and by name (A–Z).
- Filtering and sorting operate on already-loaded data.
- The user can clear/reset the active filters.

---

## Acceptance Criteria

- Selecting a filter narrows the grid to matching items.
- Changing the sort reorders the grid.
- Clearing the filters restores the full grid.

---

# Data Model

## Clothing Item

Extends the MVP-1 `clothing_item` table with:

- `name` — nullable; set by AI on successful analysis, editable by the user.

---

# Out of Scope

The following are **NOT** included in MVP-2:

- Authentication, user accounts, cross-device sync
- Prompt engineering / companion personalities
- Keep-or-donate AI evaluation
- Weather integration and weather-aware recommendations
- AI outfit recommendations
- AI-generated outfit images
- Shopping assistant
- Google Calendar integration

---

# Technical Stack

## Frontend

- React Native
- Expo
- TypeScript

## Backend

- Node.js
- TypeScript

## Database

- PostgreSQL

## Storage

- Supabase Storage (clothing images)
- Device local storage (user's name)

## AI

- Gemini API

---

# Definition of Success

MVP-2 is successful when:

1. Users can personalize the app with their name, reflected on the Home screen.
2. Every item has a clear name — auto-generated, editable, with duplicates disambiguated.
3. Users can filter and sort their wardrobe to find items quickly.
4. None of the above adds Gemini API cost beyond the existing one-call-per-upload analysis.
