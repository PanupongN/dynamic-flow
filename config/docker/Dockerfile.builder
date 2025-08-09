# Multi-stage build for Builder app
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json turbo.json ./
COPY packages packages
COPY apps/builder apps/builder

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
RUN npm run build --workspace=@dynamic-flow/builder

# Production image
FROM nginx:alpine AS runtime

# Copy built application
COPY --from=builder /app/apps/builder/dist /usr/share/nginx/html

# Copy nginx configuration
COPY config/docker/nginx.conf /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
