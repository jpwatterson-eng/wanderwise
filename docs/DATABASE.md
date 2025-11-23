# Wanderwise Database Schema

## Overview

Wanderwise uses Supabase (PostgreSQL) with Row Level Security (RLS) for data storage and security.

## Database Diagram

```
┌─────────────────────┐
│    auth.users       │  (Managed by Supabase Auth)
│─────────────────────│
│ id (UUID) PK        │
│ email               │
│ created_at          │
└─────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────┐
│      routes         │
│─────────────────────│
│ id (UUID) PK        │◄─────┐
│ user_id (UUID) FK   │      │
│ route_name          │      │
│ city                │      │ 1:N
│ total_distance      │      │
│ estimated_time      │      │
│ difficulty          │      │
│ overview            │      │
│ fitness_level       │      │
│ duration            │      │
│ interests           │      │
│ tips (JSONB)        │      │
│ is_shared (BOOL)    │      │
│ share_token (TEXT)  │      │
│ shared_at           │      │
│ created_at          │      │
└─────────────────────┘      │
                              │
                              │
                              │
                    ┌─────────────────────┐
                    │       stops         │
                    │─────────────────────│
                    │ id (UUID) PK        │
                    │ route_id (UUID) FK  │
                    │ stop_number (INT)   │
                    │ name                │
                    │ description         │
                    │ duration            │
                    │ walk_to_next        │
                    │ address             │
                    │ latitude (DECIMAL)  │
                    │ longitude (DECIMAL) │
                    │ created_at          │
                    └─────────────────────┘
```

## Tables

### `routes`

Stores walking routes created by users.

#### Columns

| Column           | Type        | Nullable | Default             | Description                                         |
| ---------------- | ----------- | -------- | ------------------- | --------------------------------------------------- |
| `id`             | UUID        | NO       | `gen_random_uuid()` | Primary key                                         |
| `user_id`        | UUID        | NO       | -                   | Foreign key to `auth.users`                         |
| `route_name`     | TEXT        | NO       | -                   | Display name for the route                          |
| `city`           | TEXT        | NO       | -                   | City where route is located                         |
| `total_distance` | TEXT        | YES      | -                   | Total walking distance (e.g., "3.2 km")             |
| `estimated_time` | TEXT        | YES      | -                   | Total time (e.g., "2 hours 15 minutes")             |
| `difficulty`     | TEXT        | YES      | -                   | Easy, Moderate, or Challenging                      |
| `overview`       | TEXT        | YES      | -                   | Brief description of the route                      |
| `fitness_level`  | TEXT        | YES      | -                   | easy, moderate, or challenging                      |
| `duration`       | TEXT        | YES      | -                   | Duration in hours (e.g., "2")                       |
| `interests`      | TEXT        | YES      | -                   | User's interests (e.g., "history and architecture") |
| `tips`           | JSONB       | YES      | -                   | Array of pro tips for the route                     |
| `is_shared`      | BOOLEAN     | YES      | `false`             | Whether route is publicly shared                    |
| `share_token`    | TEXT        | YES      | -                   | Unique token for sharing (indexed)                  |
| `shared_at`      | TIMESTAMPTZ | YES      | -                   | When route was shared                               |
| `created_at`     | TIMESTAMPTZ | NO       | `now()`             | When route was created                              |

#### Indexes

```sql
CREATE INDEX routes_user_id_idx ON routes(user_id);
CREATE INDEX routes_share_token_idx ON routes(share_token);
```

#### Constraints

```sql
-- Foreign key to auth.users
FOREIGN KEY (user_id) REFERENCES auth.users(id)

-- Unique share token
UNIQUE (share_token)
```

---

### `stops`

Stores individual stops within a route.

#### Columns

| Column         | Type          | Nullable | Default             | Description                             |
| -------------- | ------------- | -------- | ------------------- | --------------------------------------- |
| `id`           | UUID          | NO       | `gen_random_uuid()` | Primary key                             |
| `route_id`     | UUID          | NO       | -                   | Foreign key to `routes`                 |
| `stop_number`  | INTEGER       | NO       | -                   | Order of stop in route (1, 2, 3...)     |
| `name`         | TEXT          | NO       | -                   | Name of the location                    |
| `description`  | TEXT          | YES      | -                   | Details about the stop                  |
| `duration`     | TEXT          | YES      | -                   | Time to spend here (e.g., "30 minutes") |
| `walk_to_next` | TEXT          | YES      | -                   | Walking time to next stop               |
| `address`      | TEXT          | YES      | -                   | Street address                          |
| `latitude`     | DECIMAL(10,8) | YES      | -                   | GPS latitude                            |
| `longitude`    | DECIMAL(11,8) | YES      | -                   | GPS longitude                           |
| `created_at`   | TIMESTAMPTZ   | NO       | `now()`             | When stop was created                   |

#### Constraints

```sql
-- Foreign key to routes with cascade delete
FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
```

**Cascade Delete:** When a route is deleted, all its stops are automatically deleted.

---

### `auth.users`

Managed by Supabase Auth. Contains user authentication data.

#### Key Columns (Read-Only)

| Column            | Type        | Description                                     |
| ----------------- | ----------- | ----------------------------------------------- |
| `id`              | UUID        | User's unique ID (referenced in routes.user_id) |
| `email`           | TEXT        | User's email address                            |
| `created_at`      | TIMESTAMPTZ | Account creation date                           |
| `last_sign_in_at` | TIMESTAMPTZ | Last login time                                 |

---

## Row Level Security (RLS)

All tables have RLS enabled to enforce user-level permissions.

### Routes Table Policies

#### SELECT (View Routes)

```sql
CREATE POLICY "Users can view own routes"
ON routes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared routes"
ON routes FOR SELECT
USING (is_shared = true);
```

**Logic:** Users can view routes they own OR routes that are shared.

#### INSERT (Create Routes)

```sql
CREATE POLICY "Users can insert own routes"
ON routes FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Logic:** Users can only create routes with their own user_id.

#### UPDATE (Edit Routes)

```sql
CREATE POLICY "Users can update own routes"
ON routes FOR UPDATE
USING (auth.uid() = user_id);
```

**Logic:** Users can only edit their own routes.

#### DELETE (Remove Routes)

```sql
CREATE POLICY "Users can delete own routes"
ON routes FOR DELETE
USING (auth.uid() = user_id);
```

**Logic:** Users can only delete their own routes.

---

### Stops Table Policies

All policies check route ownership (not direct user_id comparison).

#### SELECT (View Stops)

```sql
CREATE POLICY "Users can view own stops"
ON stops FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM routes
    WHERE routes.id = stops.route_id
    AND routes.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view shared stops"
ON stops FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM routes
    WHERE routes.id = stops.route_id
    AND routes.is_shared = true
  )
);
```

**Logic:** Users can view stops if they own the parent route OR if the route is shared.

#### INSERT, UPDATE, DELETE

Similar pattern - checks if user owns the parent route.

---

## Common Queries

### Get User's Routes

```sql
SELECT * FROM routes
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get Route with All Stops

```sql
SELECT
  r.*,
  json_agg(
    s.* ORDER BY s.stop_number
  ) as stops
FROM routes r
LEFT JOIN stops s ON s.route_id = r.id
WHERE r.id = 'route-id-here'
GROUP BY r.id;
```

### Get Shared Route by Token

```sql
SELECT * FROM routes
WHERE share_token = 'token-here'
AND is_shared = true;
```

### Count User's Routes

```sql
SELECT COUNT(*) FROM routes
WHERE user_id = auth.uid();
```

---

## Data Migration Scripts

### Initial Setup

Run this in Supabase SQL Editor:

```sql
-- Create routes table
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  route_name TEXT NOT NULL,
  city TEXT NOT NULL,
  total_distance TEXT,
  estimated_time TEXT,
  difficulty TEXT,
  overview TEXT,
  fitness_level TEXT,
  duration TEXT,
  interests TEXT,
  tips JSONB,
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  shared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stops table
CREATE TABLE stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  walk_to_next TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX routes_user_id_idx ON routes(user_id);
CREATE INDEX routes_share_token_idx ON routes(share_token);

-- Enable RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;

-- Create policies (see RLS section above for full policy SQL)
```

### Add Sharing Feature (Migration)

```sql
ALTER TABLE routes
ADD COLUMN is_shared BOOLEAN DEFAULT false,
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN shared_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX routes_share_token_idx ON routes(share_token);
```

---

## Backup and Recovery

### Backup via Supabase Dashboard

1. Go to Database → Backups
2. Supabase automatically backs up daily
3. Can restore to any point in time

### Manual Export

```bash
# Export schema
pg_dump -h db.xxx.supabase.co -U postgres -s wanderwise > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres -a wanderwise > data.sql
```

---

## Performance Considerations

### Current Indexes

- `routes(user_id)` - Fast user route lookups
- `routes(share_token)` - Fast shared route lookups
- `stops(route_id)` - Implicit from foreign key

### Query Performance

- Average route list query: <50ms
- Route with stops query: <100ms
- Shared route lookup: <50ms

### Future Optimizations

- Add index on `routes(city)` if filtering by city becomes common
- Consider materialized view for route statistics
- Partition routes table if exceeds 1M records

---

## Data Retention

### Current Policy

- Keep all user data indefinitely
- Users can delete routes anytime
- Deleted routes cascade to stops (automatic cleanup)

### Future Considerations

- Archive old routes (>2 years unused)
- Anonymous usage statistics
- GDPR compliance (user data export/deletion)

---

## Troubleshooting

### Common Issues

**Routes not appearing**

- Check RLS policies are enabled
- Verify user is authenticated (`auth.uid()` returns value)
- Check `user_id` matches current user

**Sharing not working**

- Verify `is_shared = true` in database
- Check `share_token` is unique and not null
- Confirm RLS policy allows public SELECT on shared routes

**Stops not saving**

- Verify route exists first
- Check foreign key constraint
- Ensure user owns the parent route

### Debug Queries

```sql
-- Check current user
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('routes', 'stops');

-- View route with owner info
SELECT r.*, u.email
FROM routes r
JOIN auth.users u ON u.id = r.user_id;
```
