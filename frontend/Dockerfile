FROM node:19.8.1 AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apt-get update

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY app/package.json app/yarn.lock* app/package-lock.json* app/pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps

COPY ./app .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npx prisma generate
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

ENV PORT 3001

CMD ["yarn", "start"]
