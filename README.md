# Closy

AI-native wardrobe companion — an AI stylist that knows your wardrobe and helps you decide what to wear.

![Home screen design](design/home-screen.png)

## What it does

- **Wardrobe** — upload clothing photos (camera or library); Gemini analyzes each item for type, fit, color, pattern, season, style, material, and occasions, and gives it a short name (e.g. "White T-Shirt"). Rename items, filter by type/style, sort by newest or name.
- **AI Stylist Chat** — chat with an AI stylist that's aware of your wardrobe.
- **Settings** — set your name; the Home screen greets you by it.
- **Home** — a personalized greeting and a first look at outfit recommendations (still a static placeholder, not personalized yet).

## Planned

- Real outfit recommendations generated from the wardrobe (replacing the static placeholder)
- Weather- and calendar-aware recommendations
- Wardrobe insights (e.g. "you're missing a white T-shirt")
- Deeper AI stylist assistance — proactive daily recommendations, follow-up conversation, eventually voice

## Tech Stack

Frontend

- React Native
- Expo (Expo Router)

Backend

- Node.js
- TypeScript
- Express

Database

- PostgreSQL

AI

- Gemini API

## Project Docs

- [docs/PRODUCT.md](docs/PRODUCT.md) — vision & product philosophy
- [docs/SPEC.md](docs/SPEC.md) — current version scope & acceptance criteria
- [docs/TASKS.md](docs/TASKS.md) — task breakdown & progress
- [docs/DESIGN.md](docs/DESIGN.md) — design system (colors, typography, spacing)
- [CLAUDE.md](CLAUDE.md) — development workflow rules

## Status

v0.3.0 — Wardrobe (upload, AI analysis, naming, filter/sort), AI Stylist Chat, Settings, and Home all working end-to-end on iOS/Android via Expo Go. See [releases](https://github.com/thePolly/closy/releases) for version history.
