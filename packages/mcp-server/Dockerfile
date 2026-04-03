# Build from the scaffold-ui repository root:
#   docker build -f packages/mcp-server/Dockerfile -t scaffold-ui-mcp .
#
# Requires: package.json, pnpm-lock.yaml, pnpm-workspace.yaml, packages/, docs/, example/
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY docs ./docs
COPY example ./example

RUN pnpm install --frozen-lockfile

WORKDIR /app/packages/mcp-server
RUN pnpm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/packages/mcp-server/dist ./dist
COPY --from=builder /app/packages/mcp-server/package.json ./

ENV NODE_ENV=production
ENV PORT=3100
EXPOSE 3100

CMD ["node", "./dist/esm/bin/scaffold-ui-mcp.js", "--http"]
