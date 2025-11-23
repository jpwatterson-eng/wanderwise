# 🗺️ Wanderwise

AI-powered walking tour generator that creates personalized routes based on your interests, fitness level, and available time.

## ✨ Features

### Core Functionality

- **AI Route Generation** - Claude AI creates custom walking tours
- **Interactive Maps** - Visual route display with numbered markers
- **Turn-by-Turn Directions** - Google Maps integration for navigation
- **Route Editing** - Fix AI mistakes, add/remove/reorder stops
- **Export & Print** - PDF-ready views for offline use

### User Features

- **Authentication** - Secure email/password login
- **Private Routes** - Each user's routes are private
- **Route Sharing** - Share routes via unique links
- **Mobile Optimized** - Responsive design for phone use

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Anthropic (Claude) API key

### Local Development

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

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

4. **Set up database**

Run the SQL scripts in `/docs/database-setup.sql` in your Supabase SQL editor.

5. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System design and structure
- [Database Schema](docs/DATABASE.md) - Tables and relationships
- [API Reference](docs/API_REFERENCE.md) - API routes and functions
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy
- [Contributing Guide](docs/CONTRIBUTING.md) - Development guidelines

## 🛠️ Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Leaflet (maps)
- Lucide React (icons)

**Backend:**

- Next.js API Routes
- Supabase (PostgreSQL)
- Supabase Auth

**AI:**

- Anthropic Claude Sonnet 4

**Deployment:**

- Vercel (hosting)
- GitHub (version control)

## 📁 Project Structure

```
wanderwise/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── generate-route/
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── routes/            # Route management
│   │   ├── [id]/          # Route detail
│   │   └── [id]/print/    # Print view
│   └── shared/            # Shared route viewer
├── components/            # React components
│   ├── RouteGenerator.js
│   ├── RouteDisplay.js
│   └── RouteMap.js
├── lib/                   # Utilities
│   ├── supabase.js        # Supabase client
│   └── AuthContext.js     # Auth state management
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- User-specific route access
- Secure authentication via Supabase Auth
- API keys stored in environment variables
- HTTPS enforced in production

## 🧪 Testing

Run locally to test:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

## 📝 License

Private project - All rights reserved

## 👤 Author

Built by John Paul Watterson - 2025.11.23

## 🙏 Acknowledgments

- Anthropic Claude for AI route generation
- Supabase for backend infrastructure
- OpenStreetMap for mapping data
- Vercel for hosting
