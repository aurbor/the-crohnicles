# syntax=docker/dockerfile:1

# Debian slim (glibc) rather than Alpine (musl): Next.js 16's Turbopack/SWC
# native binary has known stability issues on musl (segfaults during
# `Collecting page data`). better-sqlite3 ships glibc prebuilds too, so this
# doesn't cost us anything on that front.
# Node 22, not 20: better-sqlite3@13 declares "engines": { "node": ">=22" }.
FROM node:22-slim AS base

# ---- deps ----
FROM base AS deps
# npm auto-runs `node-gyp rebuild` for any package with a binding.gyp
# (better-sqlite3 ships one as a from-source fallback) regardless of whether
# a matching prebuild already exists, so a compiler toolchain is required
# for `npm ci` to succeed even though the prebuilt binary is what actually
# gets used at runtime.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# `next build` imports lib/auth/session-options.ts while collecting page data
# (every layout/action pulls it in), and that file throws eagerly if
# SESSION_SECRET is missing. This placeholder only exists for this one RUN's
# process environment (not a persisted ENV layer, so it can't leak into the
# runner image) and is unrelated to the real SESSION_SECRET supplied at
# container runtime via docker-compose/Coolify.
RUN SESSION_SECRET=build-time-placeholder-do-not-use-in-production-0000000000 npm run build

# ---- runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /data && chown nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
# better-sqlite3 ships prebuilt native bindings per-platform; copy it in full so
# Next's output-file-tracing can't accidentally drop the .node binary it needs at runtime.
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

USER nextjs

EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
VOLUME ["/data"]

CMD ["node", "server.js"]
