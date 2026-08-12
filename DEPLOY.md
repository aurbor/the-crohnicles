# Deploying The Crohnicles

## Environment variables

All deployments need these four:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for the read-write Admin role |
| `CONSULTANT_PASSWORD` | Password for the read-only Consultant role |
| `SESSION_SECRET` | Random string, 32+ chars, used to encrypt the session cookie |
| `DATABASE_PATH` | Path to the SQLite file, e.g. `/data/crohnicles.db` |

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.

The SQLite database lives at `DATABASE_PATH` and must sit on a **persistent volume** — losing it loses all logged data. Migrations and the starter catalog seed (the 8 drinks + Winegums) run automatically on server boot via `instrumentation.ts`, so there's no manual migration step.

## Local / staging on the Mac Mini (Docker Compose)

```bash
cp .env.example .env   # then edit with real values
docker compose up -d --build
```

The app is served at `http://localhost:3002`. Data persists in the `crohnicles_data` named volume across restarts and rebuilds.

To view logs: `docker compose logs -f`. To stop: `docker compose down` (add `-v` only if you actually want to wipe the data volume).

## Production on Coolify

Coolify can deploy straight from this repo's `Dockerfile` — no `docker-compose.yml` needed on their end (though it works fine too):

1. Create a new **Dockerfile-based** application in Coolify, pointing at this repo.
2. Set the four environment variables above in Coolify's app settings.
3. Add a **persistent volume/storage mount** at `/data` (this is where the SQLite file lives — without this, every redeploy wipes your data).
4. Set the exposed port to `3002` and point Coolify's proxy/domain at it.
5. Deploy. First boot will apply migrations and seed the starter catalog automatically.

### Backups

Beyond the persistent volume, use the in-app **Settings → Export all data (JSON)** button periodically (or before any risky change) as a portable backup — it's a full dump of every table and can be re-imported from the same Settings page.
