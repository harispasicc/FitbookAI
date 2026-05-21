# FitBook AI

Full-stack coaching platform: clients discover coaches, book sessions, and track progress. Coaches run bookings, CRM, calendar, services, and analytics from a dedicated workspace.

Built as a production-oriented SaaS MVP with real persistence, authenticated workflows, and role-based dashboards.

## Live demo

**Production URL:** `add deployment url`

Append paths to your origin:

**Client (one-click)** | `/login?demo=1` → **Sign in as Marko S.** |
**Coach (one-click)** | `/trainer/login?demo=1` → **Sign in as Amina Hadžić** |

**Credentials**

Client | `marko.client@fitbook.ai` | `demo1234` |
Coach | `amina.trainer@fitbook.ai` | `demo1234` |

**2-minute flow**

1. Client demo → **Find coaches** → Amina → book an open slot.
2. Coach demo → **Calendar** → confirm → mark **Completed**.
3. Client → **Sessions** → rate the session.

## Preview

Add PNGs under [`docs/screenshots/`](./docs/screenshots/) before publishing the repo (avoids broken images on GitHub).

```bash
npm run dev
# another terminal:
npx playwright install chromium
npm run screenshots
```

Capture `coach-dashboard.png` manually while signed in as Amina (`/dashboard` or `/calendar`). Then embed at the top of this section, for example:

```markdown
![Landing](./docs/screenshots/landing.png)
![Client demo](./docs/screenshots/client-home.png)
![Coaches](./docs/screenshots/booking-flow.png)
![Coach workspace](./docs/screenshots/coach-dashboard.png)
![Mobile](./docs/screenshots/mobile.png)
```

## Features

### Client app (`/me`)

- Home summary, linked coach, notifications (API + header bell)
- Session booking, list, cancel, reviews after completed sessions
- Progress: goals, workout history from database
- Coach directory and public profiles with live availability
- Optional AI assistant (booking-aware tools when `OPENAI_API_KEY` is set)

### Coach workspace (`/dashboard`)

- Dashboard KPIs, analytics, client CRM with notes
- Services, availability, calendar (confirm / reschedule / complete)
- Booking notifications (in-app + optional email via Resend)
- AI drafting helpers for reminders and client summaries (coach tools)
- Plan tiers (Free / Pro / AI Pro) enforced in UI

### Platform

- Email/password auth, JWT session cookie, password reset
- Role separation (client vs trainer guards)
- Public marketing site, privacy copy, health check API

## Key engineering decisions

- **Role-based surfaces** — separate App Router layouts and guards for client (`/me`) vs coach (`/dashboard`).
- **Shared booking context** — `BookingsProvider` centralizes booking fetches and refresh events across calendar and session views.
- **Lazy-loaded AI panel** — client assistant is code-split; core flows work without it.
- **Consistent UI primitives** — shared `EmptyState`, `ModalShell`, and product tokens.
- **JWT httpOnly sessions** — cookie auth with session-expired handling and post-logout redirect to `/`.
- **Thin API routes** — handlers delegate to `src/server/modules/*` with Zod validation.
- **Optional integrations** — OpenAI and Resend are additive; the app runs without them in dev.

## Tech stack

Versions are **pinned in `package.json`** (stable releases, not canary):

Framework | Next.js `16.2.x` (App Router, Turbopack default) |
UI | React `19.2.x`, Tailwind CSS 4, Radix primitives |
Language | TypeScript 5 |
Database | PostgreSQL via Prisma `7.8.x` |
Auth | bcrypt + jose (JWT httpOnly cookie) |
Validation | Zod 4 |
AI (optional) | OpenAI Chat Completions + server-side tools |
Email (optional) | Resend |

## Project structure

```
app/                    # Routes (marketing, client, coach, API)
components/             # UI by surface (client, dashboard, site, auth)
contexts/               # Auth, bookings, trainer workspace
src/server/             # Domain services, repositories, email, AI
lib/                    # Client API helpers, mappers, shared constants
prisma/                 # Schema, migrations, seed
scripts/                # Demo reset, smoke tests, screenshot capture
docs/screenshots/       # README visuals
```

## Local development

**Requirements:** Node 20+, PostgreSQL (Neon, Supabase, or local).

```bash
git clone <your-repo-url>
cd saas-dashboard
npm install
cp .env.example .env
```

Edit `.env` — minimum:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="at-least-16-random-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo: [http://localhost:3000/login?demo=1](http://localhost:3000/login?demo=1).

Refresh demo slots after heavy testing: `npm run db:reset`.

If TypeScript complains about missing Prisma fields:

```bash
npm run db:generate
```

## Environment variables

`DATABASE_URL` | Yes | PostgreSQL connection string |
`JWT_SECRET` | Production | Session signing secret (16+ chars) |
`NEXT_PUBLIC_APP_URL` | Deploy | Public origin for emails and absolute fetches |
`OPENAI_API_KEY` | No | Enables LLM replies; otherwise rule-based assistant |
`OPENAI_MODEL` | No | Default `gpt-4o-mini` |
`RESEND_API_KEY` | No | Transactional email |
`EMAIL_FROM` | No | Verified sender |

See `.env.example`.

## Scripts

`npm run dev` | Development server |
`npm run build` | Production build |
`npm run start` | Run production build |
`npm run lint` | ESLint |
`npm run db:generate` | Regenerate Prisma client |
`npm run db:seed` | Seed demo users, coach, slots |
`npm run db:reset` | Re-seed (fresh slots, clears bookings) |

Smoke test (server running):

```bash
chmod +x scripts/test-booking-flow.sh
./scripts/test-booking-flow.sh
```

E2E tests (Playwright — requires seeded DB, single worker):

```bash
npm run db:seed
npx playwright install chromium
npm run test:e2e
```

`auth-and-guards` | 401, session, demo login, role redirects |
`booking-lifecycle` | Book → confirm → complete → UI review |
`booking-concurrency` | Double-book 409 on same slot |
`review-rules` | Review only when completed; duplicate 409 |
`client-notifications` | List + mark-read API and bell UI |

## Deployment

1. Set env vars on the host.
2. `npx prisma migrate deploy` on production `DATABASE_URL`.
3. `npm run db:seed` once for demo accounts (optional).
4. Set `NEXT_PUBLIC_APP_URL` to the public origin.
5. Configure Resend for password reset and booking email.
6. **Replace `https://YOUR_DEPLOYMENT_URL` at the top of this README** with the live link.

## Current MVP scope

Not included yet:

- Stripe billing and payouts
- Google Calendar sync
- Real subscription management
- Full analytics suite (some charts are illustrative; KPIs use live bookings)

Included: auth, booking lifecycle, CRM, reviews, notifications, optional email, optional AI.

## License

MIT — see [LICENSE](./LICENSE).
