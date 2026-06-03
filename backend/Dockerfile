# Backend — Express API
FROM node:18-alpine

ENV NODE_ENV=production
# Default to the same port used in development. The .env file is not baked into
# the image (it's .dockerignore'd), so set PORT here; k8s/runtime can override it.
ENV PORT=8000
WORKDIR /app

# Install production dependencies only, from the lockfile (reproducible builds)
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY backend/ .

# Drop privileges — node:alpine ships a non-root "node" user
USER node

# index.js listens on process.env.PORT (set above to 8000)
EXPOSE 8000
CMD ["node", "index.js"]
