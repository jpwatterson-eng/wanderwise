# Wanderwise API Reference

## Overview

Wanderwise uses Next.js API Routes for server-side operations. All API routes are located in `app/api/`.

## Base URL

**Local Development:** `http://localhost:3000/api`  
**Production:** `https://your-app.vercel.app/api`

---

## Authentication

API routes use Supabase Auth for authentication. The client automatically includes JWT tokens in requests.

### Auth Functions (Client-Side)

Located in `lib/AuthContext.js`

#### `useAuth()`

React hook to access auth state and functions.

```javascript
const { user, loading, signUp, signIn, signOut } = useAuth();
```

**Returns:**

- `user` - Current user object or null
- `loading` - Boolean, true while checking auth state
- `signUp(email, password)` - Create new account
- `signIn(email, password)` - Sign in existing user
- `signOut()` - Sign out current user

#### Example Usage

```javascript
import { useAuth } from "@/lib/AuthContext";

export default function MyComponent() {
  const { user, signOut } = useAuth();

  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

---

## API Routes

### POST `/api/generate-route`

Generate a walking route using Claude AI.

#### Request

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "city": "Prague",
  "interests": "history and architecture",
  "fitness": "moderate",
  "duration": "2"
}
```

**Parameters:**

| Field       | Type   | Required | Description                            |
| ----------- | ------ | -------- | -------------------------------------- |
| `city`      | string | Yes      | City name                              |
| `interests` | string | Yes      | User's interests                       |
| `fitness`   | string | Yes      | "easy", "moderate", or "challenging"   |
| `duration`  | string | Yes      | Duration in hours ("1", "2", "3", "4") |

#### Response

**Success (200):**

```json
{
  "routeName": "Prague's Royal Heritage Walk",
  "totalDistance": "3.2 km",
  "estimatedTime": "2 hours 15 minutes",
  "difficulty": "Moderate",
  "overview": "This captivating route takes you through Prague's historic heart...",
  "stops": [
    {
      "number": 1,
      "name": "Old Town Square",
      "description": "The historic heart of Prague...",
      "duration": "30 minutes",
      "walkToNext": "10 minutes walk",
      "address": "Staroměstské nám., 110 00 Praha 1",
      "latitude": 50.0875,
      "longitude": 14.4213
    }
  ],
  "tips": [
    "Start early in the morning to avoid crowds",
    "Bring comfortable walking shoes",
    "Carry water and snacks"
  ]
}
```

**Error (400/500):**

```json
{
  "error": "City and interests are required"
}
```

#### Implementation Details

```javascript
// Location: app/api/generate-route/route.js

export async function POST(request) {
  const { city, interests, fitness, duration } = await request.json();

  // Validate inputs
  if (!city || !interests) {
    return NextResponse.json(
      { error: "City and interests are required" },
      { status: 400 }
    );
  }

  // Call Claude API
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  // Return generated route
  return NextResponse.json(routeData);
}
```

**Rate Limiting:** None currently. Consider adding if needed.

**Cost:** ~$0.02-0.05 per route generation (Anthropic API costs)

---

## Database Operations

All database operations use the Supabase client. Located in `lib/supabase.js`.

### Supabase Client

```javascript
import { supabase } from "@/lib/supabase";
```

### Common Operations

#### Get Current User

```javascript
const {
  data: { user },
} = await supabase.auth.getUser();
```

#### Fetch User's Routes

```javascript
const { data, error } = await supabase
  .from("routes")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

#### Get Route with Stops

```javascript
// Get route
const { data: route } = await supabase
  .from("routes")
  .select("*")
  .eq("id", routeId)
  .single();

// Get stops
const { data: stops } = await supabase
  .from("stops")
  .select("*")
  .eq("route_id", routeId)
  .order("stop_number", { ascending: true });
```

#### Insert Route

```javascript
const { data, error } = await supabase
  .from("routes")
  .insert({
    user_id: user.id,
    route_name: "My Route",
    city: "Prague",
    // ... other fields
  })
  .select()
  .single();
```

#### Update Route

```javascript
const { error } = await supabase
  .from("routes")
  .update({ route_name: "New Name" })
  .eq("id", routeId);
```

#### Delete Route

```javascript
const { error } = await supabase.from("routes").delete().eq("id", routeId);
```

#### Share Route

```javascript
const shareToken = generateShareToken();

const { error } = await supabase
  .from("routes")
  .update({
    is_shared: true,
    share_token: shareToken,
    shared_at: new Date().toISOString(),
  })
  .eq("id", routeId);
```

#### Get Shared Route

```javascript
const { data, error } = await supabase
  .from("routes")
  .select("*")
  .eq("share_token", token)
  .eq("is_shared", true)
  .single();
```

---

## Component APIs

### RouteGenerator Component

Located in `components/RouteGenerator.js`

#### Props

None - self-contained component

#### State

```javascript
{
  formData: {
    city: string,
    interests: string,
    fitness: 'easy' | 'moderate' | 'challenging',
    duration: '1' | '2' | '3' | '4'
  },
  route: RouteData | null,
  loading: boolean,
  error: string | null,
  showForm: boolean
}
```

#### Methods

**`generateRoute()`**

- Validates inputs
- Calls `/api/generate-route`
- Updates state with generated route
- Hides form on success

#### Events

- Form input changes
- Generate button click
- New route button click

---

### RouteDisplay Component

Located in `components/RouteDisplay.js`

#### Props

```javascript
{
  route: {
    routeName: string,
    totalDistance: string,
    estimatedTime: string,
    difficulty: string,
    overview: string,
    stops: Stop[],
    tips: string[]
  },
  formData: {
    city: string,
    interests: string,
    fitness: string,
    duration: string
  }
}
```

#### State

```javascript
{
  saving: boolean,
  saved: boolean
}
```

#### Methods

**`saveRoute()`**

- Inserts route into database
- Inserts all stops
- Updates UI state
- Shows success message

---

### RouteMap Component

Located in `components/RouteMap.js`

#### Props

```javascript
{
  stops: Array<{
    id: string,
    name: string,
    latitude: number,
    longitude: number,
    stop_number: number,
    address?: string
  }>
}
```

#### Features

- Displays interactive Leaflet map
- Shows numbered markers for each stop
- Draws polyline connecting stops
- Auto-fits bounds to show all stops
- Click markers for popup with stop info

#### Dependencies

- `leaflet` - Mapping library
- `react-leaflet` - React bindings
- OpenStreetMap tiles (free)

---

## Error Handling

### Client-Side Errors

**Pattern:**

```javascript
try {
  // Operation
} catch (error) {
  console.error("Error message:", error);
  alert("User-friendly message");
}
```

### Server-Side Errors

**Pattern:**

```javascript
try {
  // Operation
  return NextResponse.json(data);
} catch (error) {
  console.error("Server error:", error);
  return NextResponse.json({ error: "Error message" }, { status: 500 });
}
```

### Common Error Codes

| Code | Meaning      | Typical Cause               |
| ---- | ------------ | --------------------------- |
| 400  | Bad Request  | Missing/invalid input       |
| 401  | Unauthorized | Not logged in               |
| 403  | Forbidden    | RLS policy violation        |
| 404  | Not Found    | Route doesn't exist         |
| 500  | Server Error | API failure, database error |

---

## Environment Variables

### Required Variables

| Variable                        | Type    | Description                  |
| ------------------------------- | ------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public  | Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public  | Supabase anon/public key     |
| `ANTHROPIC_API_KEY`             | Private | Claude API key (server-only) |

### Variable Prefixes

- `NEXT_PUBLIC_*` - Exposed to browser
- No prefix - Server-only

---

## Rate Limits & Quotas

### Supabase (Free Tier)

- 500MB database
- 50,000 monthly active users
- 2GB bandwidth per month
- 1GB file storage

### Anthropic API

- Pay-per-use
- ~$0.02-0.05 per route generation
- No hard rate limit (soft limit depends on billing)

### Vercel (Hobby Tier)

- 100GB bandwidth per month
- Unlimited requests
- 100 build minutes per month

---

## Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test API route
curl -X POST http://localhost:3000/api/generate-route \
  -H "Content-Type: application/json" \
  -d '{"city":"Prague","interests":"history","fitness":"moderate","duration":"2"}'
```

### Production Testing

```bash
# Test live API
curl -X POST https://your-app.vercel.app/api/generate-route \
  -H "Content-Type: application/json" \
  -d '{"city":"Prague","interests":"history","fitness":"moderate","duration":"2"}'
```

---

## API Versioning

**Current Version:** v1 (implicit, no version in URL)

**Future Considerations:**

- Add `/api/v2/` when breaking changes needed
- Maintain v1 for backward compatibility
- Document migration path

---

## Security Best Practices

1. **Never expose API keys in client code**
2. **Always use RLS policies**
3. **Validate all inputs**
4. **Use HTTPS in production** (Vercel default)
5. **Keep dependencies updated**

---

## Support & Troubleshooting

### Debug Mode

Add to `.env.local`:

```
NEXT_PUBLIC_DEBUG=true
```

### Common Issues

**"Failed to fetch"**

- Check network connection
- Verify API endpoint URL
- Check CORS (shouldn't be issue with Next.js API routes)

**"Unauthorized"**

- User not logged in
- JWT token expired (Supabase handles refresh)
- RLS policy blocking access

**"Route generation slow"**

- Claude API can take 5-15 seconds
- Normal behavior
- Consider adding progress indicator

---

## Future API Enhancements

### Planned Features

1. **PATCH `/api/routes/:id`** - Partial route updates
2. **GET `/api/routes`** - List routes with pagination
3. **POST `/api/routes/:id/duplicate`** - Copy route
4. **GET `/api/stats`** - User statistics

### Performance Improvements

1. Add caching layer (Redis)
2. Implement request queuing
3. Add API rate limiting
4. Optimize database queries
