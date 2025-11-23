# Contributing to Wanderwise

## Welcome!

Thank you for your interest in improving Wanderwise! This guide will help you set up your development environment and understand our development workflow.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Git
- Code editor (VS Code recommended)
- Supabase account (for database)
- Anthropic API key (for route generation)

### Initial Setup

1. **Clone the repository**

```bash
   git clone https://github.com/YOUR_USERNAME/wanderwise.git
   cd wanderwise
```

2. **Install dependencies**

```bash
   npm install
```

3. **Set up environment variables**

   Create `.env.local`:

```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ANTHROPIC_API_KEY=your_anthropic_key
```

4. **Run development server**

```bash
   npm run dev
```

5. **Open browser**

   Navigate to `http://localhost:3000`

---

## Development Workflow

### Branch Strategy

We use a simple branch-based workflow:

- `main` - Production-ready code, auto-deploys to Vercel
- `feature/*` - New features (e.g., `feature/route-photos`)
- `fix/*` - Bug fixes (e.g., `fix/map-loading`)
- `docs/*` - Documentation updates

### Creating a Feature

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# ... code code code ...

# Commit regularly
git add .
git commit -m "Add: description of what you added"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Commit Message Format

Use clear, descriptive commit messages:

**Good:**

```
Add: Photo upload feature for route stops
Fix: Map not displaying on mobile devices
Update: Improve route generation prompt
Docs: Add deployment troubleshooting guide
Refactor: Simplify authentication logic
```

**Bad:**

```
fixed stuff
updates
WIP
asdf
```

**Format:**

```
Type: Brief description

Optional longer description explaining why this change
was necessary and what it accomplishes.

Fixes #123 (if addressing an issue)
```

**Types:**

- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Improvement to existing feature
- `Remove:` - Remove feature/code
- `Refactor:` - Code restructuring (no functional changes)
- `Docs:` - Documentation only
- `Test:` - Adding tests
- `Style:` - Formatting, no code changes

---

## Code Standards

### JavaScript Style

**Use modern ES6+ syntax:**

```javascript
// Good
const userName = user?.name ?? 'Anonymous'
const routes = await fetchRoutes()
const filtered = routes.filter(r => r.city === 'Prague')

// Avoid
var userName = user && user.name ? user.name : 'Anonymous'
fetchRoutes().then(function(routes) { ... })
```

**Use descriptive names:**

```javascript
// Good
const userRoutes = await getUserRoutes(userId);
const isShared = route.is_shared;

// Avoid
const r = await get(u);
const flag = route.x;
```

**Keep functions small:**

```javascript
// Good
const validateEmail = (email) => {
  return email.includes("@") && email.includes(".");
};

const signUp = async (email, password) => {
  if (!validateEmail(email)) return { error: "Invalid email" };
  // ... rest of signup logic
};

// Avoid
const signUp = async (email, password) => {
  // 100 lines of mixed validation, API calls, error handling...
};
```

### React Best Practices

**Use functional components:**

```javascript
// Good
export default function MyComponent({ data }) {
  const [loading, setLoading] = useState(false);
  return <div>...</div>;
}

// Avoid class components (we don't use them)
```

**Use appropriate hooks:**

```javascript
// useState for component state
const [count, setCount] = useState(0);

// useEffect for side effects
useEffect(() => {
  loadData();
}, [dependency]);

// useContext for global state
const { user } = useAuth();
```

**Component structure:**

```javascript
export default function MyComponent({ prop1, prop2 }) {
  // 1. Hooks first
  const [state, setState] = useState()
  const { globalState } = useContext()

  // 2. Event handlers
  const handleClick = () => { ... }

  // 3. Effects
  useEffect(() => { ... }, [])

  // 4. Early returns
  if (loading) return <Spinner />

  // 5. Main render
  return (
    <div>
      {/* Clear, readable JSX */}
    </div>
  )
}
```

### CSS (Tailwind)

**Use Tailwind utilities:**

```javascript
// Good
<div className="flex items-center gap-4 p-6 bg-white rounded-lg">

// Avoid inline styles
<div style={{ display: 'flex', alignItems: 'center' }}>
```

**Responsive design:**

```javascript
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
```

**Consistent spacing:**

```javascript
// Use Tailwind scale: 1, 2, 3, 4, 6, 8, 12, 16
<div className="p-4 gap-6 mb-8">
```

### File Organization

```javascript
// Component file structure
import statements (external first, then internal)
    ↓
Type definitions (if using TypeScript)
    ↓
Component definition
    ↓
Helper functions (if small and specific to this component)
    ↓
Export
```

**Example:**

```javascript
// External imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Internal imports
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

// Component
export default function RouteList() {
  // Component code...
}

// Helper (if needed)
const formatDate = (date) => {
  // Helper code...
};
```

---

## Testing Guidelines

### Manual Testing Checklist

Before submitting changes, test:

**Authentication:**

- [ ] Can sign up with new account
- [ ] Can sign in with existing account
- [ ] Can sign out
- [ ] Redirects work correctly

**Route Generation:**

- [ ] Can generate route
- [ ] Route displays correctly
- [ ] Can save route
- [ ] Loading states work

**Route Management:**

- [ ] Can view saved routes
- [ ] Can edit route
- [ ] Can delete route
- [ ] Changes persist

**Sharing:**

- [ ] Can share route
- [ ] Share link works without login
- [ ] Can copy to own account
- [ ] Can unshare route

**Mobile:**

- [ ] Works on phone screen sizes
- [ ] Touch interactions work
- [ ] Map is usable on mobile

### Browser Testing

Test on:

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

### Automated Testing (Future)

```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Lint code
npm run lint
```

---

## Submitting Changes

### Pull Request Process

1. **Create PR on GitHub**

   - Clear title describing the change
   - Detailed description of what and why
   - Link to related issues (if any)
   - Add screenshots for UI changes

2. **PR Template**

```markdown
## What does this PR do?

Brief description of changes

## Why?

Explanation of motivation

## How to test?

1.  Steps to verify the change
2.  Expected behavior
3.  Edge cases to check

## Screenshots (if UI changes)

Before: [image]
After: [image]

## Checklist

- [ ] Tested locally
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Documentation updated (if needed)
```

3. **Code Review**

   - Address reviewer feedback
   - Make requested changes
   - Re-request review when ready

4. **Merge**
   - Once approved, merge to main
   - Delete feature branch
   - Deployment happens automatically

### PR Best Practices

**Small, focused PRs:**

- One feature or fix per PR
- Easier to review
- Faster to merge
- Less risk of conflicts

**Good PR:**

- 50-200 lines changed
- Single logical change
- Clear purpose

**Avoid:**

- Mixing features in one PR
- Changing unrelated files
- Massive refactoring PRs

---

## Project Structure

```
wanderwise/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes (server-side)
│   │   └── generate-route/      # Claude AI integration
│   ├── login/                   # Auth pages
│   ├── signup/
│   ├── routes/                  # Route management
│   │   ├── [id]/               # Dynamic route detail
│   │   │   ├── page.js         # Route detail view
│   │   │   └── print/          # Print-friendly view
│   │   └── page.js             # Routes list
│   ├── shared/                  # Public route sharing
│   │   └── [token]/
│   ├── layout.js               # Root layout (wraps all pages)
│   ├── page.js                 # Homepage (route generator)
│   └── globals.css             # Global styles
│
├── components/                  # Reusable React components
│   ├── RouteGenerator.js       # Form + generation logic
│   ├── RouteDisplay.js         # Display + save route
│   └── RouteMap.js             # Leaflet map
│
├── lib/                         # Utilities and helpers
│   ├── supabase.js             # Supabase client
│   └── AuthContext.js          # Global auth state
│
├── public/                      # Static assets
│   └── (favicon, images, etc.)
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── .env.local                   # Environment variables (NOT in git)
├── .gitignore                   # Files to ignore in git
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── README.md                   # Project overview
└── tailwind.config.js          # Tailwind CSS config
```

### When to Create New Files

**New page:**

- Create in `app/` folder
- Next.js auto-routes based on folder structure

**New component:**

- If reusable → `components/`
- If page-specific → Keep in page file or create subfolder

**New utility:**

- Create in `lib/`
- Export functions for use elsewhere

---

## Common Tasks

### Adding a New Page

```bash
# Create folder in app/
mkdir app/my-page

# Create page component
touch app/my-page/page.js
```

```javascript
// app/my-page/page.js
export default function MyPage() {
  return <div>My new page</div>;
}
```

Access at: `http://localhost:3000/my-page`

### Adding a New API Route

```bash
# Create API route folder
mkdir -p app/api/my-endpoint

# Create route handler
touch app/api/my-endpoint/route.js
```

```javascript
// app/api/my-endpoint/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  const data = await request.json();
  // Process data
  return NextResponse.json({ success: true });
}
```

Access at: `http://localhost:3000/api/my-endpoint`

### Adding a Database Column

```sql
-- In Supabase SQL Editor
ALTER TABLE routes
ADD COLUMN new_field TEXT;
```

Update code to use new field:

```javascript
// When inserting
.insert({
  // ... existing fields
  new_field: value
})
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (carefully!)
npm update

# Test after updating
npm run dev
```

---

## Code Review Guidelines

### As a Reviewer

**Look for:**

- Code works as described
- Follows our coding standards
- No obvious bugs
- Good error handling
- Clear, understandable code
- Appropriate comments (if needed)

**Provide:**

- Constructive feedback
- Specific suggestions
- Praise for good solutions
- Questions if unclear

### As a PR Author

**Respond to:**

- All review comments
- Answer questions clearly
- Explain your reasoning
- Make requested changes

**Don't:**

- Take criticism personally
- Ignore feedback
- Argue unnecessarily
- Rush to merge

---

## Getting Help

### Resources

**Documentation:**

- Check `/docs` folder first
- Read relevant Next.js/React/Supabase docs
- Search GitHub issues

**Communication:**

- Create GitHub issue for bugs/features
- Comment on existing issues
- Reach out to maintainer directly

### Asking Good Questions

**Include:**

- What you're trying to do
- What you expected
- What actually happened
- Steps to reproduce
- Error messages (full text)
- Screenshots (if UI issue)

**Example:**

```
I'm trying to add a new field to the route form, but it's not saving.

Expected: New field saves to database
Actual: Field appears in UI but doesn't save

Steps:
1. Added input to RouteGenerator.js
2. Updated formData state
3. Clicked save

Error: No error in console, but checking database shows field is null

Screenshot: [image]

Relevant code:
[paste code snippet]
```

---

## Tips for Success

### Development Tips

1. **Test early, test often**

   - Don't wait until PR to test
   - Test each change as you make it

2. **Commit frequently**

   - Small commits are easier to review
   - Easier to debug if something breaks
   - Better git history

3. **Read error messages**

   - They usually tell you exactly what's wrong
   - Google the error if unclear
   - Check browser console and terminal

4. **Use git effectively**

```bash
   # Undo last commit (keep changes)
   git reset --soft HEAD~1

   # Discard local changes
   git checkout -- filename

   # View change history
   git log --oneline

   # See what changed
   git diff
```

5. **Keep learning**
   - Read others' code
   - Try new patterns
   - Ask "why" not just "how"

### Project-Specific Tips

**Route Generation:**

- Test with different cities
- Verify coordinates are accurate
- Check edge cases (1 hour vs 4 hours)

**Authentication:**

- Always test logged-out state
- Check redirect flows
- Verify RLS policies work

**Sharing:**

- Test in incognito window
- Verify unsharing works
- Check security (can't access private routes)

**Mobile:**

- Test on real device when possible
- Check touch targets are large enough
- Verify forms are usable on small screens

---

## Recognition

Contributors are recognized in:

- Git commit history
- Release notes (for significant features)
- README acknowledgments

Thank you for contributing to Wanderwise! 🗺️✨
