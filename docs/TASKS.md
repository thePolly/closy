# v0.6.0

- [x] Add `app_user` table (login, email, password_hash columns)
- [x] Add `user_id` column to `clothing_item`
- [x] Add POST /auth/login (find-or-create by login, case-insensitive)
- [x] Scope all wardrobe endpoints by user_id
- [x] Scope chat's wardrobe context by user_id
- [x] Add Login field to onboarding screen
- [x] Store the logged-in user's id locally and send it as an X-User-Id header
- [x] Verify two different logins see separate wardrobes
