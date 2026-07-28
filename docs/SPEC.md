# v0.6.0 – Login & Multi-User Support

## Goal

Give each person their own separate wardrobe by adding a simple login step, laying the groundwork for real authentication later without redesigning the data model.

## Features

- Add a Login field to onboarding, alongside the existing Name field, in the same screen.
- Backend finds-or-creates an account for that login (case-insensitive, no password yet) the first time it's used.
- Every device that logs in with the same login sees that account's own wardrobe, never anyone else's.
- All wardrobe items and chat context are scoped per account.

## Acceptance Criteria

- Onboarding asks for both a Login and a Name.
- Logging in with a new login creates a fresh, empty wardrobe for that account.
- Logging in with an existing login (e.g. after reinstalling) restores that account's wardrobe.
- Two different logins never see each other's wardrobe items or chat context.
- Name continues to work exactly as before: local only, editable in Settings, used just for the greeting.

## Out of Scope

- Password / real authentication.
- Email verification.
- Changing your login once it's set.
- Syncing name across devices.
- Account recovery ("forgot my login").

## Technical Notes

- New `app_user` table: `id`, `login` (unique, case-insensitive), `email` (nullable, unused for now), `password_hash` (nullable, unused for now — never a raw password).
- New `user_id` column on `clothing_item`.
- New `POST /auth/login` endpoint.
- Mobile sends the logged-in user's id via an `X-User-Id` header on every wardrobe/chat request.
