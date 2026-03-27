# Oddaaa Website + Lead Intake MVP

Marketing website and lead capture workflow for small-business client onboarding.

## Features

- Multi-page responsive marketing site (`/`, `/services`, `/process`, `/pricing`, `/about`, `/contact`)
- Lead intake form posting to `POST /api/leads`
- Lead persistence in SQLite (`data/leads.db`) plus CSV mirror (`data/leads.csv`) for sheet import
- Notification hooks:
  - SMTP email (`NOTIFY_TO`) when SMTP env vars are configured
  - Generic webhook (`LEAD_WEBHOOK_URL`) for CRM/Sheets automation
- Basic SEO files (`sitemap.xml`, `robots.txt`)
- Analytics event stubs via `window.trackEvent`

## Local run

```bash
cp .env.example .env
npm install
npm start
```

Open `http://localhost:3000`.

## API

### `GET /api/health`

Returns service health and lead count.

### `POST /api/leads`

Accepts JSON body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-111-2222",
  "businessName": "Acme Plumbing",
  "website": "https://acme.example",
  "serviceInterest": "Marketing website + lead capture",
  "monthlyLeads": "20-40",
  "timeline": "Launch in 6 weeks",
  "budgetRange": "8k-12k",
  "goals": "Increase qualified quote requests from the website",
  "referralSource": "Google"
}
```

## Deployment

- Recommended runtime: Node.js 20+
- Set `SITE_URL` and update `site/sitemap.xml` + `site/robots.txt` domain
- Configure SMTP and/or webhook for notifications
- See deployment and handoff details in `docs/deployment-handoff.md`
