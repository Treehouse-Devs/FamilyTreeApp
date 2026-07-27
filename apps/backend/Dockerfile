# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:22.23.1-slim@sha256:813a7480f28fdadac1f7f5c824bcdad435b5bc1322a5968bbbdef8d058f9dff4

FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/dto/package.json ./packages/dto/package.json
RUN yarn install --frozen-lockfile

FROM dependencies AS builder
COPY apps/backend ./apps/backend
COPY packages/dto ./packages/dto
RUN yarn workspace backend build

FROM builder AS production-dependencies
ENV NODE_ENV=production

RUN yarn install --frozen-lockfile --production=true --ignore-scripts --prefer-offline \
  && rm -rf /app/node_modules/ts-node \
  && mkdir -p /app/apps/backend/node_modules

FROM ${NODE_IMAGE} AS runner
WORKDIR /app/apps/backend

ENV NODE_ENV=production \
    PORT=3000

COPY --from=production-dependencies /app/node_modules /app/node_modules
COPY --from=production-dependencies /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/dist-migrations ./dist-migrations
COPY --from=builder /app/apps/backend/src/mailer/templates ./src/mailer/templates
COPY --from=builder /app/apps/backend/scripts/staging-e2e-admin.cjs ./scripts/staging-e2e-admin.cjs
COPY apps/backend/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p uploads \
  && chown -R node:node /app/apps/backend/uploads \
  && chmod +x /app/apps/backend/scripts/staging-e2e-admin.cjs \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
