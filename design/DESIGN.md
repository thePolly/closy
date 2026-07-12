# Design System

Source of truth for colors, typography, and spacing across the app. Values below were sampled directly from pixel colors in `home-screen.png` (not eyeballed), then checked against what's actually hardcoded in the mobile app today.

## Colors

| Token | Hex | Used for |
|---|---|---|
| `background` | `#FDF6EC` | App background (warm cream) |
| `surface` | `#FFFFFF` | Elevated cards on top of the background — the white "Today" card and wardrobe thumbnails in the mockup |
| `ink-primary` | `#1A1A1A` | Headlines, primary content text |
| `ink-secondary` | `#2E2A25` | Subtitles and secondary body text (e.g. "Here's your look for today") |
| `ink-muted` | `#8A8578` | Hints, placeholders, empty states — lower emphasis than `ink-secondary` |
| `accent` | `#D9A441` | Primary actions, active tab state, highlights |
| `accent-soft` | `#FEF0CA` | Small badges and subtle highlighted backgrounds |
| `border` | `#E0D5C2` | Dividers, input borders |
| `surface-dark` | `#2C2A26` | Dark-treatment elements — FAB button, outgoing chat bubble, cancel button |

**Note on `accent`:** the mockup's raw sampled gold is closer to `#F2A93B`/`#FFBB01` — noticeably more saturated. The app already independently settled on the more muted `#D9A441`, which reads calmer and fits PRODUCT.md's "warm, calm" principle better than the mockup's brighter version. Keeping the muted value is an intentional deviation, not an oversight.

## Typography

- **Display / headlines** — bold serif (e.g. "Good morning, Polina!", "Today"). Not implemented yet — the app currently renders all text in the system default sans-serif. Adding a serif Google Font (Playfair Display or Lora) via `expo-font` is the target for MVP-1's Home screen.
- **Body / everything else** — system sans-serif. Regular weight for body text, medium/semibold for buttons and labels.

## Shape & Spacing

- Corner radius: `12` for cards and thumbnails, `16–24` for buttons/badges/pills, fully circular for the FAB and avatar-style elements.
- Card padding: `16`.
- Screen horizontal padding: `16–20`.

## Iconography

Outline-style icons (Ionicons `*-outline` variants) — already matches what's implemented in the tab bar.

## Known gaps between this system and the current code

Not yet applied — flagging for a future task rather than changing silently:

1. **Tab bar tint** — currently uses the default blue active-tab color; not yet set to `accent` gold like the mockup.
2. **No serif display font** — all text currently uses the system default sans-serif everywhere, including headlines.
3. **`ink-secondary` vs `ink-muted` not yet distinguished** — the code currently uses one gray (`#8A8578`, i.e. `ink-muted`) for everything secondary. Subtitles that should read as `ink-secondary` (higher emphasis) currently look the same as placeholder/hint text.
4. **No `surface` card pattern yet** — Home and Wardrobe currently render flat against the `background` color; the mockup's elevated white cards aren't built yet. First needed for MVP-1's Home screen.
5. **Tab order/labels differ from the mockup** — mockup shows "Today, Chat, Wardrobe, Settings"; the built app has "Home, Wardrobe, Chat, Settings." Flagging the mismatch, not changing it without confirmation.
