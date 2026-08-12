# The Crohnicles 🧪

An 8-week polymeric diet tracker — drinks, food, medication, mood, symptoms, a daily journal, and a calendar + report view for the whole saga. Built for one admin (read-write) and one consultant (read-only, calendar + reports).

## Stack

Next.js 16 (App Router) · TypeScript · Drizzle ORM + SQLite (better-sqlite3) · Tailwind CSS · Framer Motion · Recharts · @react-pdf/renderer · iron-session

## Local development

```bash
cp .env.example .env.local   # fill in ADMIN_PASSWORD, CONSULTANT_PASSWORD, SESSION_SECRET
npm install
npm run dev
```

Runs on [http://localhost:3002](http://localhost:3002). Database migrations and the starter catalog seed (8 drinks + Winegums) run automatically on server boot — no manual step needed.

Useful scripts:

```bash
npm run db:generate   # generate a new Drizzle migration after a schema.ts change
npm run db:migrate    # apply migrations manually
npm run db:seed       # re-run the seed manually
npm run lint          # eslint
npm run build          # production build
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for running via Docker Compose (Mac Mini staging) or Coolify (production).
