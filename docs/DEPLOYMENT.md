# Wanderwise Deployment Guide

## Overview

This guide covers deploying Wanderwise to production using Vercel and Supabase.

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Supabase project created
- [ ] Anthropic API key
- [ ] Code pushed to GitHub repository

---

## Initial Setup

### 1. Supabase Configuration

#### Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - **Name:** wanderwise
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is sufficient to start
4. Wait 2-3 minutes for project to initialize

#### Run Database Setup

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Copy the complete SQL from `docs/database-setup.sql` (create this file with all table creation SQL)
4. Click **"Run"**
5. Verify tables created:
   - Go to **"Table Editor"**
   - Should see `routes` and `stops` tables

#### Get API Credentials

1. In Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"**
3. Copy these values (you'll need them for Vercel):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long JWT token)

#### Configure Authentication

1. Click **"Authentication"** in sidebar
2. Click **"URL Configuration"**
3. Set **Site URL** to your Vercel URL (can update later)
4. Add **Redirect URLs**:
   - `http://localhost:3000/**` (for local dev)
   - `https://your-app.vercel.app/**` (update after deployment)
5. Click **"Save"**

---

### 2. Anthropic API Setup

1. Go to https://console.anthropic.com
2. Sign up or log in
3. Go to **"API Keys"**
4. Click **"Create Key"**
5. Name it "Wanderwise Production"
6. Copy the key (starts with `sk-ant-...`)
7. Add billing information (pay-as-you-go)
8. Add initial credits ($5-10 recommended)

---

## Deployment to Vercel

### First-Time Deployment

#### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Wanderwise MVP"

# Create repository on GitHub
# Go to github.com → New Repository → Name: "wanderwise"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/wanderwise.git
git branch -M main
git push -u origin main
```

#### 2. Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your repositories
5. Find **"wanderwise"** repository
6. Click **"Import"**

#### 3. Configure Environment Variables

**Before clicking Deploy:**

1. Expand **"Environment Variables"** section
2. Add these three variables:

**Variable 1:**

- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase project URL
- **Environments:** Production, Preview, Development (all checked)

**Variable 2:**

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase anon key
- **Environments:** Production, Preview, Development (all checked)

**Variable 3:**

- **Name:** `ANTHROPIC_API_KEY`
- **Value:** Your Claude API key (sk-ant-...)
- **Environments:** Production, Preview, Development (all checked)

#### 4. Deploy

1. Leave all other settings as default
2. Click **"Deploy"**
3. Wait 2-3 minutes for build to complete
4. You'll get a URL like: `https://wanderwise-abc123.vercel.app`

#### 5. Update Supabase with Production URL

1. Go back to Supabase dashboard
2. **Authentication** → **URL Configuration**
3. Update **Site URL** to: `https://wanderwise-abc123.vercel.app`
4. Update **Redirect URLs** to include: `https://wanderwise-abc123.vercel.app/**`
5. Click **"Save"**

---

## Post-Deployment Configuration

### Custom Domain (Optional)

#### Use Vercel Subdomain

1. In Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Change from `wanderwise-abc123` to `wanderwise` (if available)
4. New URL: `https://wanderwise.vercel.app`

#### Use Custom Domain

1. Purchase domain from:

   - Namecheap (~$10-15/year)
   - Google Domains
   - Cloudflare
   - GoDaddy

2. In Vercel:

   - **Settings** → **"Domains"**
   - Click **"Add"**
   - Enter your domain (e.g., `wanderwise.com`)
   - Follow DNS configuration instructions

3. Update DNS records at your registrar:

```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
```

4. Wait 24-48 hours for DNS propagation

5. Update Supabase redirect URLs to include new domain

---

## Continuous Deployment

### Automatic Deployments

Every push to `main` branch triggers automatic deployment:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push

# Vercel automatically:
# 1. Detects the push
# 2. Builds the app
# 3. Runs tests (if configured)
# 4. Deploys to production
# 5. Updates your URL
```

**Typical deployment time:** 2-3 minutes

### Preview Deployments

Vercel creates preview deployments for pull requests:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Create PR on GitHub
# Vercel creates preview URL automatically
# Test changes before merging
```

### Rollback

If something breaks:

1. Go to Vercel dashboard
2. Click **"Deployments"**
3. Find last working deployment
4. Click **"..."** → **"Promote to Production"**
5. Instant rollback!

---

## Environment-Specific Configuration

### Development (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
ANTHROPIC_API_KEY=sk-ant-...
```

### Production (Vercel)

Set via Vercel dashboard or CLI:

```bash
# Using Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ANTHROPIC_API_KEY
```

### Preview (Vercel)

Inherits from Production by default, can override if needed.

---

## Monitoring & Analytics

### Vercel Analytics

**Enable:**

1. Vercel dashboard → **"Analytics"**
2. Toggle **"Enable Analytics"**
3. Free tier includes:
   - Page views
   - Unique visitors
   - Top pages
   - Geographic distribution

### Vercel Speed Insights

**Enable:**

1. Vercel dashboard → **"Speed Insights"**
2. Toggle **"Enable"**
3. Tracks:
   - Core Web Vitals
   - Page load times
   - Performance scores

### Supabase Monitoring

**Built-in metrics:**

1. Supabase dashboard → **"Database"**
2. Click **"Reports"**
3. View:
   - Database size
   - API requests
   - Active users
   - Query performance

### Error Tracking (Optional)

Consider adding Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Performance Optimization

### Build Optimization

**Already Configured:**

- Next.js automatic code splitting
- Image optimization
- Static page generation where possible

**Additional Optimization:**

```javascript
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add these for production
  swcMinify: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```

### Database Optimization

**Check indexes:**

```sql
-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('routes', 'stops');
```

**Add if missing:**

```sql
CREATE INDEX IF NOT EXISTS routes_user_id_idx ON routes(user_id);
CREATE INDEX IF NOT EXISTS routes_share_token_idx ON routes(share_token);
CREATE INDEX IF NOT EXISTS stops_route_id_idx ON stops(route_id);
```

### Caching Strategy

**Vercel Edge Network:**

- Static assets automatically cached
- API routes can add cache headers:

```javascript
export async function GET(request) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
```

---

## Security Checklist

### Pre-Deployment

- [ ] Environment variables set (not hardcoded)
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys in client code
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enforced (Vercel default)
- [ ] Content Security Policy configured (optional)

### Post-Deployment

- [ ] Test authentication flow
- [ ] Verify route privacy (user separation)
- [ ] Test shared route access
- [ ] Check error messages don't leak sensitive info
- [ ] Review Supabase logs for unauthorized access attempts

### Regular Maintenance

- [ ] Update dependencies monthly: `npm outdated`
- [ ] Review Supabase auth logs weekly
- [ ] Monitor API costs (Anthropic dashboard)
- [ ] Check Vercel bandwidth usage
- [ ] Backup database (Supabase auto-backups)

---

## Backup & Disaster Recovery

### Database Backups

**Supabase automatic backups:**

- Daily backups (7 days retention on free tier)
- Point-in-time recovery
- Access: Database → Backups

**Manual backup:**

```bash
# Export schema
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -s wanderwise > backup-schema.sql

# Export data
pg_dump -h db.xxxxx.supabase.co \
  -U postgres \
  -a wanderwise > backup-data.sql
```

### Code Backups

- GitHub is primary backup
- Vercel keeps deployment history
- Clone locally as additional backup:

```bash
git clone https://github.com/YOUR_USERNAME/wanderwise.git wanderwise-backup
```

### Recovery Process

**If database corrupted:**

1. Supabase dashboard → Database → Backups
2. Select restore point
3. Click "Restore"
4. Wait 5-10 minutes

**If deployment broken:**

1. Vercel dashboard → Deployments
2. Find last working deployment
3. Promote to production

**If code lost:**

1. Clone from GitHub
2. Redeploy to Vercel

---

## Scaling Considerations

### Current Capacity

**Free tier limits:**

- Vercel: ~100,000 requests/month
- Supabase: 500MB database, 50,000 MAU
- Sufficient for: 100-500 active users

### When to Upgrade

**Vercel Pro ($20/month):**

- Trigger: >100GB bandwidth/month
- Benefits: Higher limits, better support, team features

**Supabase Pro ($25/month):**

- Trigger: >500MB database or >50,000 users
- Benefits: 8GB database, 100,000 MAU, daily backups

**Anthropic:**

- Pay-as-you-go scales automatically
- Monitor costs in Anthropic dashboard
- ~$50-100/month for 1,000-2,000 routes generated

### Performance at Scale

**1,000 users:**

- Current setup sufficient
- No changes needed

**10,000 users:**

- Consider Redis caching
- Add CDN for static assets
- Optimize database queries

**100,000+ users:**

- Upgrade Supabase plan
- Add read replicas
- Implement rate limiting
- Consider dedicated infrastructure

---

## Troubleshooting Deployment Issues

### Build Failures

**"Module not found"**

```bash
# Fix: Ensure package installed
npm install missing-package
git add package.json package-lock.json
git commit -m "Add missing dependency"
git push
```

**"ESLint errors"**

```javascript
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};
```

**"Environment variable undefined"**

- Check Vercel dashboard → Settings → Environment Variables
- Ensure variable names match exactly
- Redeploy after adding variables

### Runtime Errors

**"Failed to connect to Supabase"**

1. Verify environment variables in Vercel
2. Check Supabase project is active
3. Test API credentials locally

**"Authentication not working"**

1. Check Supabase redirect URLs include your domain
2. Verify site URL is correct
3. Clear cookies and try again

**"Route generation fails"**

1. Check Anthropic API key is valid
2. Verify API key has credits
3. Check API rate limits

### DNS Issues

**"Domain not resolving"**

- Wait 24-48 hours for DNS propagation
- Use `dig your-domain.com` to check DNS records
- Verify DNS records match Vercel requirements

**"SSL certificate error"**

- Vercel auto-generates SSL (1-24 hours)
- If delayed, contact Vercel support
- Check domain ownership verification

---

## Cost Breakdown

### Monthly Costs (Estimated)

**Minimal Usage (Testing/Family):**

- Vercel: $0 (Free tier)
- Supabase: $0 (Free tier)
- Anthropic: $0-5 (10-100 routes generated)
- Domain: $1-2/month (if purchased)
- **Total: $0-7/month**

**Moderate Usage (100 users):**

- Vercel: $0 (Free tier sufficient)
- Supabase: $0-25 (may need Pro)
- Anthropic: $10-20 (200-500 routes)
- Domain: $1-2/month
- **Total: $11-47/month**

**Heavy Usage (1,000+ users):**

- Vercel: $20 (Pro plan)
- Supabase: $25 (Pro plan)
- Anthropic: $50-100 (1,000-2,000 routes)
- Domain: $1-2/month
- **Total: $96-147/month**

---

## Deployment Checklist

### Pre-Deployment

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] RLS policies tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsiveness verified

### Deployment

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Initial deployment successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

### Post-Deployment

- [ ] Sign up flow tested
- [ ] Route generation tested
- [ ] Route saving tested
- [ ] Route sharing tested
- [ ] Mobile devices tested
- [ ] Performance verified
- [ ] Analytics enabled
- [ ] Team members invited

### Launch

- [ ] Share URL with intended users
- [ ] Monitor error logs first 24 hours
- [ ] Check API costs
- [ ] Gather user feedback
- [ ] Document issues for future fixes

---

## Getting Help

### Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Anthropic Docs:** https://docs.anthropic.com

### Support Channels

- **Vercel:** Support ticket via dashboard
- **Supabase:** Discord community + support tickets
- **Next.js:** GitHub discussions
- **Anthropic:** Email support

### Common Issues Database

Keep track of issues and solutions:

| Issue                      | Solution                         | Occurred   |
| -------------------------- | -------------------------------- | ---------- |
| Build failed due to ESLint | Added `ignoreDuringBuilds: true` | 2024-11-15 |
| Clipboard API failed       | Added fallback with manual copy  | 2024-11-15 |
| ...                        | ...                              | ...        |

---

## Version History

| Version | Date       | Changes              | Deployed By |
| ------- | ---------- | -------------------- | ----------- |
| v0.1    | 2024-11-08 | Initial MVP          | You         |
| v0.2    | 2024-11-14 | Added auth & sharing | You         |
| v0.3    | TBD        | Future updates       | You         |

---

## Next Steps After Deployment

1. **Monitor for 24 hours**

   - Check error logs
   - Watch user signups
   - Verify route generation working

2. **Gather feedback**

   - Share with family
   - Note any issues
   - Collect feature requests

3. **Plan improvements**

   - Review enhancement list
   - Prioritize based on feedback
   - Schedule development time

4. **Document learnings**
   - What went well?
   - What was difficult?
   - What would you do differently?
