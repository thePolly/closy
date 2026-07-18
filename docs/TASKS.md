# MVP-0

## Project Setup

- [x] Create the React Native Expo project in the `/mobile` folder.
- [x] Create the Node.js TypeScript backend in the `/backend` folder.
- [x] Configure PostgreSQL and verify the backend can connect to the database.

---

## Navigation

- [x] Create a bottom navigation bar with four tabs: Home, Wardrobe, Chat, and Settings.
- [x] Home and Settings should display a simple placeholder screen for MVP-0.
- [x] Wardrobe and Chat should be fully functional.

---

## Wardrobe

- [x] Allow the user to take a photo using the camera.
- [x] Allow the user to choose an existing photo from the gallery.
- [x] Display a preview of the selected photo before uploading.
- [x] After selecting a photo, display **Upload** and **Cancel** buttons.
- [x] If the user presses **Cancel**, return to the Wardrobe screen without saving.
- [x] If the user presses **Upload**, save the image and display it in the wardrobe gallery.
- [x] Display uploaded clothing items as a grid of square image cards.

---

## Chat

- [x] Create a chat interface with a message history and text input.
- [x] Connect the chat to the Gemini API.
- [x] Display AI responses in the conversation.

---

# MVP-1

## Home

- [x] Build the Home screen: personalized greeting, hardcoded outfit recommendation, and a placeholder recommendation card.
- [x] Layout renders correctly on both small and large device sizes.

---

## AI Clothing Analysis

- [x] Extend the `clothing_item` table with `fit`, `primary_color`, `secondary_color`, `pattern`, `season`, `style`, `material`, `suitable_occasions`, `confidence_score`, and `analysis_status`.
- [x] On upload, send the image to Gemini (synchronously) and parse its response into the new structured fields.
- [x] On success, store the metadata, confidence score, and set `analysis_status` to `completed`.
- [x] On failure, still save the image, leave metadata empty, and set `analysis_status` to `failed`.
- [x] Add a retry endpoint that re-runs analysis for a single item on demand.
- [x] `GET /wardrobe` (and any single-item fetch) returns the new metadata fields.

---

## Wardrobe — Clothing Details Screen

- [x] Tapping an item in the Wardrobe grid opens a details screen for that item.
- [x] Details screen shows: image, clothing type, fit, primary/secondary color, pattern, season, style, material, suitable occasions, and confidence score.
- [x] Fields with no detected value are shown as "Not detected" instead of blank or broken.
- [x] If `analysis_status` is `failed`, show a **Retry analysis** button that calls the retry endpoint and updates the screen on success.

---

## Quality

- [x] Show a loading indicator while the Clothing Details screen is fetching its data.
- [x] Show a loading/disabled state on the Retry analysis button while a retry is in progress.
- [x] Show a clear error message if the Clothing Details screen fails to load.
- [x] Show a clear error message if a retry attempt fails, without losing the item.

---

# MVP-2

## Settings & Profile

- [x] Add a name input to the Settings screen.
- [x] Persist the name on the device (local storage) across app restarts.
- [x] Home greeting shows the name when set and falls back to the generic greeting when empty.
- [x] Allow editing or clearing the name.

---

## AI Item Naming

- [x] Extend the clothing analysis (same Gemini call) to also return a short descriptive name.
- [x] Add a `name` column to `clothing_item`.
- [x] On save, number duplicate names ("White T-Shirt", then "White T-Shirt 2").
- [x] Show the item name on the wardrobe grid cards and the details screen.
- [x] Let the user edit an item's name on the details screen (backend endpoint + UI).
- [x] Generate the name on retry for previously-failed items.

---

## Wardrobe Filter & Sort

- [x] Filter the grid by clothing type, season, style, and color.
- [x] Sort by newest (default) and by name (A–Z).
- [x] Filtering and sorting operate on already-loaded data (no new API calls).
- [x] Allow clearing/resetting the active filters.

---

# v0.4.0

## Add Clothing Through Chat

- [ ] Decide the image-generation model/API (see SPEC.md Feature 1).
- [ ] Detect whether a chat message describes a clothing item to add.
- [ ] Extract clothing attributes from the message via Gemini (reuse the existing analysis fields).
- [ ] Generate a product-style image on a white background for the item.
- [ ] Save the new item (attributes + generated image) to the wardrobe.
- [ ] Reply in chat confirming the item was added, or explaining a failure.

## Simple Onboarding

- [ ] Add a 1–2 screen onboarding flow asking for the user's name.
- [ ] Show onboarding on first launch only (no name stored yet), before the tab navigator.
- [ ] Save the name using the existing local-storage helper.
- [ ] Skip onboarding on subsequent launches once a name exists.

## Weather on Home

- [ ] Decide the weather API provider (see SPEC.md Feature 3).
- [ ] Add `expo-location` and request location permission.
- [ ] Fetch current temperature, condition, and icon for the user's location.
- [ ] Wire the Home weather card to real data, matching the existing design.
- [ ] Handle loading and error states (denied permission, failed fetch) gracefully.
