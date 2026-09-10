# Multi-stage Dockerfile for HoneyChain React Frontend (Vite + TS + Vanilla CSS)

# Stage 1: Build static assets using Node 20
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . ./
RUN npm run build

# Stage 2: Serve SPA with Nginx
FROM nginx:1.25-alpine AS runner

# Remove default Nginx site configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
