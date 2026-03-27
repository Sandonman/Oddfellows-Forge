# Deployment and Handoff Notes

## Environment Variables

- `PORT` (default `3000`)
- `SITE_URL` (public website URL)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `NOTIFY_TO`, `NOTIFY_FROM`
- `LEAD_WEBHOOK_URL` (optional CRM/Sheet bridge)

## Production Setup

1. Provision Node.js 20+ host (Render/Fly/Railway/VM).
2. Deploy repository and run `npm ci`.
3. Set environment variables.
4. Start service with `npm start`.
5. Verify:
   - `GET /api/health` returns `ok: true`
   - Submit a lead from `/contact.html`
   - Confirm row in `data/leads.db` and `data/leads.csv`
   - Confirm notification (email or webhook)

## SEO and Analytics Handoff

1. Replace `example.com` entries in `site/sitemap.xml` and `site/robots.txt` with production domain.
2. Submit sitemap in Google Search Console.
3. Replace `trackEvent` stub in `site/app.js` with GA4 or another analytics destination.

## Operations Runbook

- Lead source of truth: SQLite table `leads`
- Quick CSV export: `cp data/leads.csv <destination>`
- Backup cadence: snapshot `data/leads.db` daily
- Fallback if SMTP fails: webhook and CSV still retain submissions

## Acceptance Criteria Mapping

- 5-8 pages responsive site: implemented (6 pages)
- Lead form persistence: SQLite + CSV write on each submission
- Owner notification in <= 1 minute: immediate SMTP/webhook dispatch at submit time (assuming provider availability)
- Editable pages via CMS/admin UI: **not implemented in this MVP** (requires phase-2 CMS integration)
