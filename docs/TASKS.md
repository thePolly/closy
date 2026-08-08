# v0.7.0

- [x] Add `daily_recommendation` table (user_id PK, date, description, item_ids, missing_suggestions)
- [x] Cache POST /wardrobe/recommend-outfit per user per calendar day; add `force` flag to bypass cache and regenerate
- [x] Store `image_url` as a relative path instead of a full URL; resolve via PUBLIC_ASSET_BASE_URL at read time
- [x] Send `ngrok-skip-browser-warning` header on auth requests (local dev over ngrok tunnel)
