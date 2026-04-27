# ============================================================
# Stage 1 — Build
# Compiles the Angular application for production
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
# node_modules is only reinstalled when package*.json changes
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source files and build for production
COPY . .
RUN npm run build -- --configuration production

# ============================================================
# Stage 2 — Serve
# Serves the compiled Angular app with Nginx
# Final image contains only Nginx + static files — no Node.js
# ============================================================
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular production build from Stage 1
COPY --from=builder /app/dist/taskflow-ui/browser /usr/share/nginx/html

# Set correct ownership and permissions on static files
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
