# Wanderwise Architecture

## System Overview

Wanderwise is a full-stack Next.js application with server-side API routes, client-side React components, and Supabase backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       Browser                            │
│  ┌────────────────────────────────────────────────┐    │
│  │          React Components (Client)              │    │
│  │  - RouteGenerator                               │    │
│  │  - RouteDisplay                                 │    │
│  │  - RouteMap (Leaflet)                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Next.js Server                        │
│  ┌────────────────────────────────────────────────┐    │
│  │              API Routes                         │    │
│  │  /api/generate-route → Claude AI                │    │
│  └────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────┐    │
│  │           Page Rendering                        │    │
│  │  - SSR for SEO                                  │    │
│  │  - Static generation where possible             │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Supabase Client
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
│  ┌────────────────────────────────────────────────┐    │
│  │           PostgreSQL Database                   │    │
│  │  - routes table (with RLS)                      │    │
│  │  - stops table (with RLS)                       │    │
│  │  - auth.users (managed by Supabase)            │    │
│  └────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────┐    │
│  │         Authentication Service                   │    │
│  │  - Email/password auth                          │    │
│  │  - Session management                           │    │
│  │  - JWT tokens                                   │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Route Generation Flow

```
User Input
    ↓
RouteGenerator Component
    ↓
POST /api/generate-route
    ↓
Claude API (with prompt)
    ↓
JSON Response (route + stops)
    ↓
RouteDisplay Component
    ↓
User clicks "Save Route"
    ↓
Supabase INSERT (routes + stops tables)
    ↓
Database stores with user_id
```

### 2. Authentication Flow

```
User enters email/password
    ↓
AuthContext.signIn()
    ↓
Supabase Auth API
    ↓
JWT token returned
    ↓
Token stored in browser
    ↓
All subsequent requests include token
    ↓
Supabase RLS validates user_id
```

### 3. Route Sharing Flow

```
Owner clicks "Share Route"
    ↓
Generate unique share_token
    ↓
UPDATE routes SET is_shared=true
    ↓
Share link: /shared/{token}
    ↓
Anyone can access (no auth required)
    ↓
RLS policy: "is_shared = true"
    ↓
Viewer can copy to their account
```

## Component Architecture

### Page Components (app/)

- **Server Components by default** - Fast initial load
- **Client Components** (`'use client'`) - Interactive features

### Shared Components (components/)

All client components for interactivity:

- `RouteGenerator` - Form + API call + state management
- `RouteDisplay` - Display route + save button
- `RouteMap` - Leaflet map (dynamic import, SSR disabled)

### Context Providers (lib/)

- `AuthContext` - Global auth state, wraps entire app

## State Management

### Local State (useState)

- Form inputs
- Loading states
- Error messages
- Edit mode toggles

### Server State (Supabase)

- User data
- Routes and stops
- Shared route status

### Global State (Context)

- Current user (AuthContext)
- Auth loading state

## Security Model

### Row Level Security (RLS)

**Routes table:**

```sql
-- Users can only view their own routes
WHERE auth.uid() = user_id

-- OR routes that are shared
OR is_shared = true
```

**Stops table:**

```sql
-- Stops inherit route permissions
WHERE route_id IN (
  SELECT id FROM routes WHERE user_id = auth.uid()
)
```

### API Security

- Environment variables for API keys
- Never expose keys to client
- Server-side API calls only

## Performance Optimizations

### Current Optimizations

1. **Dynamic imports** - RouteMap loads only when needed
2. **Static generation** - Login/signup pages
3. **Client-side navigation** - Next.js Link component
4. **Image optimization** - Next.js automatic

### Future Opportunities

1. Route caching (React Query)
2. Lazy loading for route lists
3. Service worker for offline support
4. Database indexes (already added for user_id, share_token)

## Deployment Architecture

```
GitHub Repository
    ↓
    Push to main branch
    ↓
Vercel (Auto-deploy)
    ↓
    Build Next.js app
    ↓
    Deploy to CDN
    ↓
Production URL
```

### Environment Variables (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL` - Exposed to client
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Exposed to client
- `ANTHROPIC_API_KEY` - Server-only

## Error Handling Strategy

### Client-Side

- Try-catch blocks around async operations
- User-friendly error messages via alerts
- Console logging for debugging

### Server-Side (API Routes)

- Validate inputs
- Catch API errors
- Return appropriate HTTP status codes
- Log errors server-side

### Database

- RLS policies prevent unauthorized access
- Foreign key constraints maintain data integrity
- Cascade deletes for related data

## Future Architecture Considerations

### Scalability

- Current: Suitable for hundreds of users
- Consider: Redis caching for 1000+ concurrent users
- Consider: CDN for static assets

### Monitoring

- Add error tracking (Sentry)
- Add analytics (Vercel Analytics)
- Add performance monitoring

### Testing

- Unit tests for components
- Integration tests for API routes
- E2E tests for critical flows
