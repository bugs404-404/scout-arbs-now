# Multi-stage: node 20 builds the SPA, nginx alpine serves the static dist.
#
# DEFAULTS = empty so the SPA uses same-origin URLs (api.ts derives WS from
# window.location, REST from "" prefix → relative to current page). This
# makes the image portable across LAN / public tunnel / any hostname with
# zero rebuilds. Override by passing build args ONLY if you have a reason
# to point the bundle at a different backend host:
#   docker build --build-arg VITE_API_URL=https://api.example.com .

FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL=
ARG VITE_WS_URL=
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
