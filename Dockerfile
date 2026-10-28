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
FROM node:22-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS base

# Enable Corepack once in the base stage so every derived stage inherits it.
# Stages do not share state, so enabling it only in deps would leave the
# builder stage running the image's global Yarn 1, which refuses to start
# once package.json pins packageManager to Yarn 4.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Upgrade OpenSSL ahead of the base image. node:22-alpine currently ships
# libssl3/libcrypto3 3.5.7-r0, which Trivy flags for ten CVEs; Alpine has
# 3.5.8-r0 in its repositories. The tag already floats, so waiting for a
# newer node:22-alpine achieves nothing until upstream rebuilds - see #475.
#
# Named packages rather than a blanket `apk upgrade`: a whole-repo upgrade
# would make the image's contents vary with Alpine's state rather than with
# this file, so a build could start failing for reasons absent from the diff.
#
# Done in base so every derived stage inherits it. Only the runner stage is
# scanned, but it derives from here, so this is the single place to fix it.
RUN apk add --no-cache --upgrade libssl3 libcrypto3

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
