# syntax=docker/dockerfile:1

FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app

# Copy the whole workspace (see .dockerignore for exclusions)
COPY . .

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/api-server build

# ---- Runtime image ----
FROM node:24-slim AS runtime
RUN corepack enable
ENV NODE_ENV=production
WORKDIR /app

# Bring over the built workspace: node_modules (for externalized deps
# like @aws-sdk/*, pino-pretty) + the built dist/ output
COPY --from=build /app /app

WORKDIR /app/artifacts/api-server

# App reads PORT from the environment and throws if it's missing —
# ECS Express Mode will inject it via the container-port setting / env vars.
EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]
