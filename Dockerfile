# Multi-stage: node 20 builds the SPA, nginx alpine serves the static dist.
# VITE_API_URL / VITE_WS_URL are baked in at build time — pass them via
# --build-arg or compose build.args so the bundled JS targets the right
# backend.

FROM node:20-alpine AS build
WORKDIR /app

# Build args injected by docker compose / docker build --build-arg
ARG VITE_API_URL=http://192.168.100.144:8000
ARG VITE_WS_URL=ws://192.168.100.144:8000/ws/arbs
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ─── Runtime ───────────────────────────────────────────────────────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
