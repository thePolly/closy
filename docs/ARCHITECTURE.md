# Architecture

## Architectural Style

- React Native Expo mobile client
- Node.js TypeScript backend
- PostgreSQL database
- External AI services

## Logical Components

- Mobile application
- Chat
- Wardrobe
- Clothing item management
- AI orchestration
- Image generation
- Backend API
- Persistence

### System Context

```

User

  │

  ▼

Closy

  │

  ▼

Gemini API

```

### Container

```

┌─────────────────────────────┐

│ React Native Mobile App     │

└──────────────┬──────────────┘

               │ REST API

               ▼

┌─────────────────────────────┐

│ Node.js Backend             │

└───────┬───────────┬─────────┘

        │           │

        ▼           ▼

 PostgreSQL     Gemini API

```
