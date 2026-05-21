# README screenshots

## Quick capture (automated)

With `npm run dev` running:

```bash
npx playwright install chromium
node scripts/capture-readme-screenshots.mjs
```

Writes `landing.png`, `client-home.png` (demo login), `booking-flow.png` (coach directory), `mobile.png`.

## Manual (recommended for auth screens)

| File | Route / action |
|------|----------------|
| `coach-dashboard.png` | Sign in as Amina → `/dashboard` or `/calendar` |
| `client-home.png` (logged in) | Sign in as Marko → `/me` (overwrite automated shot if you prefer) |
| `booking-flow.png` (wizard) | Marko → Amina profile → slot picker |

Use ~1280×720 for desktop and ~390×844 for mobile. PNG format.
