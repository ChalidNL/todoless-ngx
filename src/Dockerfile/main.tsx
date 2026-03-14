# Multi-stage build for production-ready Todoless app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the React app with Vite
RUN npm run build

# Production stage
FROM node:20-alpine

# Install dumb-init and postgresql-client for proper signal handling and DB init
RUN apk add --no-cache dumb-init postgresql-client

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S todoless -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app from builder
COPY --from=builder --chown=todoless:nodejs /app/dist ./dist
COPY --from=builder --chown=todoless:nodejs /app/server.js ./
COPY --from=builder --chown=todoless:nodejs /app/public ./public

# Copy database initialization files
COPY --chown=todoless:nodejs init.sql ./init.sql
COPY --chown=todoless:nodejs init-db.sh ./init-db.sh
RUN chmod +x ./init-db.sh

# Create data directory for persistent storage
RUN mkdir -p /app/data && chown todoless:nodejs /app/data

# Switch to non-root user
USER todoless

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/app/init-db.sh"]

# Start the application
CMD ["node", "server.js"]
