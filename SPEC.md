# Closy MVP-1

**Version:** 0.2

**Status:** In Development

---

# Goal

Transform the wardrobe into an intelligent collection by automatically analyzing uploaded clothing items.

The AI should understand each clothing item and store structured metadata that will enable future features such as outfit recommendations, wardrobe insights, filtering, and personalized styling.

---

# Feature 1 — Home Screen

## Description

Introduce the Home screen to establish the future user experience.

For MVP-1, all recommendations are hardcoded and do not depend on user data.

---

## Requirements

The Home screen displays:

- a personalized greeting
- a hardcoded outfit recommendation
- a placeholder recommendation card

---

## Acceptance Criteria

- The Home screen is accessible from the bottom navigation.
- All UI elements render correctly.
- The layout is responsive on supported devices.

---

# Feature 2 — AI Clothing Analysis

## Description

After a clothing item is uploaded, the backend sends the image to Gemini for analysis, synchronously as part of the upload request.

Gemini returns structured metadata describing the clothing item.

The metadata is stored together with the uploaded image.

---

## Requirements

For every uploaded clothing item, Gemini should identify:

- clothing type
- fit
  - Slim Fit
  - Regular Fit
  - Relaxed Fit
  - Oversized
- primary color
- secondary color (if applicable)
- pattern
  - Solid
  - Striped
  - Plaid
  - Polka Dot
  - Floral
  - Graphic
- season
- style
  - Casual
  - Business
  - Smart Casual
  - Formal
  - Evening
  - Sport
- material (when confidently identifiable)
- suitable occasions (if recognizable)
- one overall confidence score for the detection (not per attribute)

---

## Analysis Failure Handling

- Analysis runs synchronously during the upload request — the client waits for the result.
- If analysis fails (Gemini error, timeout, malformed response), the clothing item is still saved with its image; `analysis_status` is set to `failed` and metadata fields are left empty.
- The Wardrobe Details screen (Feature 3) shows a **Retry analysis** action for any item with `analysis_status = failed`, which re-runs the same synchronous analysis on demand.
- No background jobs or automatic retry scheduling in MVP-1 — retries are always user-triggered.

---

## Acceptance Criteria

- Uploaded images are sent to Gemini as part of the upload request.
- On success, structured metadata and a confidence score are stored in PostgreSQL, and `analysis_status` is set to `completed`.
- On failure, the image is still stored, `analysis_status` is set to `failed`, and no partial/incorrect metadata is saved.
- Metadata can be retrieved through the backend API.
- A failed item can be retried through a manual action; on success it updates to `completed` with the new metadata.

---

# Feature 3 — Wardrobe Details

## Description

Users can view AI-generated information for each clothing item.

---

## Requirements

Selecting a clothing item opens a details screen displaying:

- clothing image
- clothing type
- fit
- primary and secondary color
- pattern
- season
- style
- material
- suitable occasions
- overall confidence score
- a **Retry analysis** action, shown only when `analysis_status` is `failed`

---

## Acceptance Criteria

- Users can open any clothing item.
- All available metadata is displayed correctly.
- Missing metadata is handled gracefully (fields with no value are omitted or shown as "Not detected", not left blank/broken).
- Items with failed analysis show the retry action; using it re-runs analysis and updates the screen on success.

---

# Data Model

## Clothing Item

Extends the MVP-0 `clothing_item` table (`id`, `image_url`, `created_at`) with:

- `clothing_type`
- `fit`
- `primary_color`
- `secondary_color` (nullable)
- `pattern`
- `season`
- `style`
- `material` (nullable)
- `suitable_occasions` (nullable)
- `confidence_score` (single overall value)
- `analysis_status` — `pending` | `completed` | `failed`

---

# Out of Scope

The following features are **NOT** included in MVP-1:

- AI outfit recommendations
- Weather integration
- Google Calendar integration
- Push notifications
- AI-generated outfit images
- Shopping assistant
- Multiple AI companions
- Automatic daily outfit generation
- Background/async analysis processing or scheduled auto-retries

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

- Supabase Storage

## AI

- Gemini API

---

# Definition of Success

MVP-1 is considered successful when:

1. Every newly uploaded clothing item is automatically analyzed by Gemini and stored with structured metadata.
2. Users can view that metadata for any item on the Wardrobe Details screen.
3. A failed analysis never blocks the user — the image and item remain usable, and analysis can be retried on demand.
4. The Home screen exists as the foundation for future personalized recommendations.
