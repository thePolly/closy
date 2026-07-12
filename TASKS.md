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

- [ ] Tapping an item in the Wardrobe grid opens a details screen for that item.
- [ ] Details screen shows: image, clothing type, fit, primary/secondary color, pattern, season, style, material, suitable occasions, and confidence score.
- [ ] Fields with no detected value are shown as "Not detected" instead of blank or broken.
- [ ] If `analysis_status` is `failed`, show a **Retry analysis** button that calls the retry endpoint and updates the screen on success.

---

## Quality

- [ ] Show a loading indicator while the Clothing Details screen is fetching its data.
- [ ] Show a loading/disabled state on the Retry analysis button while a retry is in progress.
- [ ] Show a clear error message if the Clothing Details screen fails to load.
- [ ] Show a clear error message if a retry attempt fails, without losing the item.
