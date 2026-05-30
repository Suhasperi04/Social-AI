# GrowMyAccount AI

> **Know Exactly Why You're Not Growing.**

AI-powered Instagram Growth Analyst that helps creators understand why their account isn't growing, what content performs best, what competitors are doing better, and what actions to take next.

## Features

- 🏥 **Account Health Score** — 0-100 score with content, engagement, consistency, and growth breakdowns
- 👤 **Profile Analysis** — Bio, CTA, positioning, and username optimization review
- 🚫 **Growth Blockers** — Priority-ranked issues holding your account back
- 🏆 **Winning Content** — Topics, formats, and timing patterns that drive performance
- 🔍 **Competitor Insights** — Side-by-side comparison with opportunity gaps
- 💡 **Content Ideas** — AI-generated reel, carousel, and story ideas
- ⏰ **Best Time to Post** — Data-driven posting schedule with heatmaps
- 📋 **30-Day Growth Plan** — Personalized weekly plan with goals and actions

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **AI**: Google Gemini 2.0 Flash
- **Database**: Supabase PostgreSQL
- **Auth**: Meta OAuth (Instagram Business Login)
- **State**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Validation**: Zod

## Prerequisites

- Node.js 18+
- Supabase account ([supabase.com](https://supabase.com))
- Meta Developer account ([developers.facebook.com](https://developers.facebook.com))
- Gemini API key ([aistudio.google.com](https://aistudio.google.com))

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-social
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor in Supabase Dashboard
3. Run the SQL in `supabase/migrations/001_initial_schema.sql`

### 4. Meta App Setup

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app (type: Business)
3. Add "Instagram Graph API" product
4. Configure OAuth redirect URI: `http://localhost:3000/api/auth/callback`
5. Copy App ID and App Secret to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   ├── page.tsx           # Landing page
│   └── layout.tsx         # Root layout
├── lib/
│   ├── ai/                # Gemini AI client & prompts
│   ├── instagram/         # Instagram Graph API wrapper
│   ├── supabase/          # Supabase clients
│   ├── store/             # Zustand stores
│   └── validations/       # Zod schemas
└── types/                 # TypeScript types
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all environment variables
4. Update `META_REDIRECT_URI` to your production domain
5. Deploy

## Important Notes

- Only Instagram **Business** or **Creator** accounts are supported
- Meta App Review is required for production (Live mode)
- Instagram API rate limit: 200 calls/user/hour
- Reports are cached for 24 hours to minimize API calls
- Free plan: 5 reports, 3 competitor analyses, 20 content ideas
- Pro plan: Unlimited everything at ₹199/month

## License

Private — All rights reserved.
"# Social-AI" 
