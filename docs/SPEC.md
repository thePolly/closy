# v0.8.0 – Smarter, More Personal Recommendations

## Goal

Move outfit recommendations from "plausible guess" to something that reasons more like an actual stylist — noticing details a garment photo already shows (decorative trim, its color) and knowing who it's dressing (age group, style preference), instead of working from color/type/pattern alone.

## Features

- Clothing analysis now also captures distinctive garment details (e.g. bows, ruffles, peplum, ties, contrasting buttons, lace trim, embroidery) and the color of that detail, when present.
- Onboarding asks for age group and style preference, alongside the existing Login/Name fields. Both are optional — skippable, can be set later.
- Age group and style preference are editable later in Settings.
- The outfit recommendation prompt is rewritten to reason explicitly about color harmony (including distinctive details) and to factor in the user's age group and style preference when both are known.

## Acceptance Criteria

- A newly-analyzed item with a notable decorative detail (e.g. a colored bow) has that detail and its color captured in `distinctive_details`; a plain item with nothing notable leaves it blank.
- Onboarding allows continuing without setting age group or style preference.
- Setting or changing age group/style preference in Settings is reflected in the next recommendation generated (cache permitting — see v0.7.0's daily cache).
- A wardrobe item with a clashing accent-color detail (e.g. a purple bow) is not paired into an outfit it visibly clashes with, when a better-matching alternative exists in the wardrobe.
- Recommendation descriptions read as more specific/deliberate than before (e.g. referencing why a piece fits the person's style), not just "here's a combination."

## Out of Scope

- An explicit structured `category` field (Top/Bottom/Accessory/etc.) — considered and dropped; the existing free-text `clothing_type` plus prompt reasoning is sufficient for now, since Gemini already infers outfit structure from it reasonably well.
- Backfilling `distinctive_details` for items uploaded before this version — only newly-analyzed or re-analyzed items get it.
- Multiple style preference tags — single tag only for this version.
- Any change to the chat stylist (`generateStylistReply.ts`) — this version only touches the daily outfit recommendation.

## Technical Notes

- New `clothing_item.distinctive_details` column: TEXT, nullable. Free text, not a closed enum — a garment can have an open-ended variety of decorative details, so a fixed list would lose information. AI populates it only when something is notable, explicitly naming the detail's color when relevant (e.g. `"black bow at the waist"`, `"purple button placket"`).
- New `app_user.age_group` column: TEXT, nullable. Values: `Teen (13–19)`, `20s`, `30s`, `40s`, `50s`, `60+`.
- New `app_user.style_preference` column: TEXT, nullable, single value (not multi-select, to keep the schema and onboarding UI simple for this version). Values: `Casual`, `Classic`, `Minimalist`, `Streetwear`, `Romantic`, `Edgy`.
- `analyzeClothing.ts`: `RESPONSE_SCHEMA` and prompt extended to capture `distinctiveDetails`.
- `recommendOutfit.ts`: prompt rewritten to (a) reason explicitly about color harmony including distinctive details, (b) receive and factor in the user's age group and style preference when set, (c) frame the model's role more deliberately as a professional stylist rather than a generic combiner.
- `POST /auth/login`: accepts optional `ageGroup`/`stylePreference` at account creation.
- New `PATCH /users/me`: updates `ageGroup`/`stylePreference` for the logged-in user (used by Settings).
- Mobile: onboarding gains age group and style preference pickers (both skippable); Settings gains the same fields, editable.
