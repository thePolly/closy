# Closy MVP-0

**Version:** 0.1

**Status:** Ready for Development

---

# Goal

Validate the core product experience.

A user should be able to upload clothing items and receive outfit recommendations from an AI stylist.

---

# Scope

MVP-0 includes only the essential functionality required to validate the product idea.

---

# Feature 1 — AI Wardrobe

## Description

Users can take a photo of a clothing item.

The AI automatically analyzes the image and adds it to the user's wardrobe.

No manual categorization is required.

---

## Requirements

The user can:

- take a photo of a clothing item
- upload an existing photo
- see all uploaded clothing items in the wardrobe

The AI automatically detects:

- clothing type
- primary color

The detected information is stored together with the image.

---

## Out of Scope

The user cannot manually edit categories.

Filtering and advanced organization are not included in MVP-0.

---

## Acceptance Criteria

- User can upload a clothing photo.
- AI successfully analyzes the image.
- Clothing appears inside the wardrobe.
- Image is stored successfully.
- AI metadata is stored successfully.

---

# Feature 2 — AI Stylist Chat

## Description

Users can chat with their personal AI stylist.

The stylist uses the uploaded wardrobe to answer outfit-related questions.

---

## Example Questions

- What should I wear today?
- What matches these jeans?
- I have dinner tonight.
- Give me a casual outfit.

---

## Requirements

The stylist:

- knows the user's wardrobe
- answers conversationally
- explains outfit choices

---

## Acceptance Criteria

- User can send a message.
- AI returns a response.
- Responses use clothing from the wardrobe whenever possible.

---

# Data Model

## Clothing Item

Each clothing item contains:

- id
- image
- detected clothing type
- detected color
- created date

---

# Out of Scope

The following features are NOT included in MVP-0:

- Authentication
- Weather integration
- Notifications
- Outfit image generation
- Google Calendar integration
- Shopping recommendations
- Companion personalities
- Wardrobe insights
- Clothing editing
- Manual categorization
- Filters
- Outfit history

---

# Technical Stack

Frontend

- React Native
- Expo
- TypeScript

Backend

- Node.js
- TypeScript

Database

- PostgreSQL

Storage

- Supabase Storage

AI

- Gemini API

---

# Definition of Success

MVP-0 is considered successful when a user can:

1. Upload clothing photos.
2. Build a digital wardrobe.
3. Chat with the AI stylist.
4. Receive useful outfit recommendations based on the uploaded wardrobe.
