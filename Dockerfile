# Pinned, small base. Alpine = ~50 MB.
FROM node:20-alpine

# Non-root user for safety
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app

# Copy package files FIRST so the npm ci layer is cached
# across source-only changes.
COPY --chown=app:app package*.json ./
RUN npm ci --only=production

# Source code last
COPY --chown=app:app . .

ENV NODE_ENV=production PORT=4009
EXPOSE 4009

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:4009/health || exit 1

CMD ["node", "index.js"]
