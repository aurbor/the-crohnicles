# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
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
