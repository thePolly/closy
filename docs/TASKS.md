# v0.6.0

- [ ] Add `app_user` table (login, email, password_hash columns)
- [ ] Add `user_id` column to `clothing_item`
- [ ] Add POST /auth/login (find-or-create by login, case-insensitive)
- [ ] Scope all wardrobe endpoints by user_id
- [ ] Scope chat's wardrobe context by user_id
- [ ] Add Login field to onboarding screen
- [ ] Store the logged-in user's id locally and send it as an X-User-Id header
- [ ] Verify two different logins see separate wardrobes
