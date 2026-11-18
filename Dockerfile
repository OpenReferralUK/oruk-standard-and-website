# Production Dockerfile for ORUK ORUK

# Pinned by digest, not by tag alone. node:22-alpine floats: upstream
# republished it on 2026-10-22 and moved it from Alpine 3.23 to 3.24 with no
# PR and no review, which is the realistic route to a broken libc6-compat or
# native module. Pinning turns that into a Dependabot PR someone reads.
#
# It also makes the scan result attributable. While the tag floated there was
# no way to tell a stale build from an upstream that had not patched yet,
# because nothing recorded which image had been scanned; a finding that
# persists against a pinned digest provably means upstream has not fixed it.
#
# The tag is kept alongside the digest so Dependabot knows what to track.
# See #475.
FROM node:22-alpine@sha256:0e1754758c2df4cfa3e68d59e2e1b7374bb7fd9ea6328eaaacf15cc934af8202 AS base

# Enable Corepack once in the base stage so every derived stage inherits it.
# Stages do not share state, so enabling it only in deps would leave the
# builder stage running the image's global Yarn 1, which refuses to start
# once package.json pins packageManager to Yarn 4.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Upgrade the OS packages ahead of the base image. Alpine publishes fixes
# faster than the Node images are rebuilt, so the image as pulled is routinely
# behind its own distribution: libssl3/libcrypto3 were 3.5.7-r0 against an
# available 3.5.8-r0 (#501), and zlib is 1.3.2-r1 against an available 1.4-r0
# (CVE-2026-4738) even on the digest Dependabot bumped to in #535.
#
# This upgrades every installed package rather than a named list. #501 named
# libssl3 and libcrypto3 deliberately, so that image contents varied with this
# file rather than with Alpine's repository state - but #503 then pinned the
# base by digest, which supplies that reproducibility independently. With the
# base fixed, the only remaining variance is Alpine's own package versions,
# and the alternative is a Dockerfile edit for every new CVE in a package
# nobody thought to list. zlib was the second.
#
# The image is built only by the CI security jobs and is never pushed or
# served, so the worst case is a failed Docker & ZAP Scan check on a PR.
#
# Done in base so every derived stage inherits it. Only the runner stage is
# scanned, but it derives from here, so this is the single place to fix it.
RUN apk upgrade --no-cache

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files. .yarnrc.yml is required: it selects the node-modules
# linker, and without it Yarn would fall back to its PnP default here.
COPY package.json yarn.lock* .yarnrc.yml* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn install --immutable; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Opt in to Next.js standalone output. Only the Docker image needs it; Vercel
# builds leave it unset so they use Vercel's own output format.
ENV BUILD_STANDALONE=true

# Build the application
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Remove npm from the runtime image. The standalone server starts with
# `node server.js` and never shells out to a package manager, so npm is
# dead weight here - but it is the single largest source of findings in
# the scan: its vendored dependencies account for 28 of the container's
# 48 Trivy alerts, including a CRITICAL in tar 7.5.11. Note that copy is
# npm's own and unrelated to the project's tar, which resolves to 7.5.22.
#
# Only the runner stage is stripped. deps and builder keep npm so the
# package-lock.json fallback branches above still work. See #475.
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
