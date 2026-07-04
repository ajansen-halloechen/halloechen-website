# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=pnpm-workspace.yaml,target=pnpm-workspace.yaml \
    pnpm fetch --frozen-lockfile

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline

RUN pnpm build

# pnpm keeps @img packages nested; npm installs sharp + libvips .so where Nitro loads them.
RUN cd .output/server \
    && npm install --no-save --no-package-lock --include=optional sharp@0.35.1

FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

USER root

RUN apk add --no-cache su-exec \
    && chown node:node /app \
    && mkdir -p /app/files/avatars \
    && chown -R node:node /app/files

COPY --from=builder --chown=node:node /app/.output ./.output
COPY --from=builder --chown=node:node /app/server/database/migrations ./server/database/migrations
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
