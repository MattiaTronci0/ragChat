# Backend Dockerfile
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodeuser && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodeuser -g nodeuser nodeuser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads && \
    touch metadata.json && \
    chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "server.js"]