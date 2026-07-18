# Closy v0.3.0

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

v0.3.0 is successful when:

1. Users can personalize the app with their name, reflected on the Home screen.
2. Every item has a clear name — auto-generated, editable, with duplicates disambiguated.
3. Users can filter and sort their wardrobe to find items quickly.
4. None of the above adds Gemini API cost beyond the existing one-call-per-upload analysis.

---

# Closy v0.4.0

**Version:** 0.4

**Status:** Ready for Development

---

# Goal

Make wardrobe management feel AI-native instead of form-based: add clothing by describing it in chat, greet new users with minimal onboarding, and surface live weather on Home.

Unlike v0.3.0, this release does add new API cost — image generation per chat-added item and a weather API call per Home visit.

---

# Feature 1 — Add Clothing Through Chat

## Description

Users describe a clothing item in natural language in the Chat screen (e.g. "I bought a white oversized linen shirt") instead of uploading a photo. The app extracts structured attributes with an LLM, generates a clean product-style image on a white background, and adds the item to the wardrobe automatically.

## Requirements

- The chat's Gemini call is given an `add_clothing_item` tool; the model invokes it when a message describes a clothing item to add, and responds normally otherwise. Intent detection is the model's own decision (function calling), not a manual keyword rule.
- The tool call extracts clothing attributes (type, color, fit, style, etc. — the same fields as photo-based analysis).
- Generate a product-style image of the item on a plain white background using Gemini's image generation.
- Save the item to the wardrobe using the extracted attributes and generated image.
- Reply in the chat confirming the item was added to the wardrobe.

## Acceptance Criteria

- Describing a clothing item in chat results in a new wardrobe item with a generated image and sensible attributes.
- The chat shows a confirmation message once the item is added.
- A message that isn't a clothing description doesn't create an item — normal chat still works.
- If extraction or image generation fails, the chat tells the user and no partial/broken item is created.

## Out of Scope

- Voice input.
- Editing existing wardrobe items through chat.
- Deleting items through chat.
- Outfit recommendations.

---

# Feature 2 — Simple Onboarding

## Description

On first launch, a minimal 1–2 screen flow asks for the user's name, saves it locally, and personalizes the Home greeting. Returning users skip straight to Home.

## Requirements

- Detect first launch (no name stored locally yet).
- Ask for the user's name on a simple onboarding screen.
- Save the name locally, using the same storage the Settings screen already uses.
- Skip onboarding on subsequent launches once a name is stored.

## Acceptance Criteria

- First launch shows onboarding; entering a name lands on Home with a personalized greeting.
- Closing and reopening the app afterward goes straight to Home — onboarding isn't shown again.
- The name set here is the same one shown and editable on the Settings screen.

---

# Feature 3 — Weather on Home

## Description

Integrate a weather API and display the current weather in the weather card already shown in the Home screen design.

## Requirements

- Fetch weather from a public weather API using the user's current location (with permission).
- Display current temperature, a weather icon, and condition (e.g. "Sunny", "Cloudy", "Rain").
- Load automatically when the Home screen opens.

## Acceptance Criteria

- Weather is fetched from a public weather API.
- User location is obtained with permission.
- Current temperature, icon, and condition are displayed.
- Loading and error states are handled gracefully.
- The UI matches the existing Home screen design.

## Out of Scope

- Weather forecasts.
- AI recommendations based on weather.
- Outfit suggestions.
- Weather notifications.

---

# Technical Stack — New for v0.4.0

- Gemini image generation, for product-style clothing photos — keeps a single AI provider rather than adding a separate image API.
- Gemini function calling (tool use) in the chat orchestration, so the model itself decides when to invoke `add_clothing_item` — the chat integration is currently plain prompt/response with no tools.
- [Open-Meteo](https://open-meteo.com/) for weather — free and keyless, no API key/signup needed.
- `expo-location` — device location permission and coordinates; not currently a dependency.

---

# Definition of Success

v0.4.0 is successful when:

1. A user can add a clothing item by describing it in chat, with no form or photo required.
2. First-time users get a short onboarding instead of landing on an unpersonalized app.
3. The Home screen shows real, current weather for the user's location.
