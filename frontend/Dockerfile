# ---- Build stage: compile the Vite/React app to static assets ----
FROM node:18-alpine AS build
WORKDIR /app

# Backend URL is read via import.meta.env.VITE_BASE_URL and baked into the
# bundle at build time, so it must be supplied as a build arg.
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ---- Runtime stage: serve the static build with nginx ----
FROM nginx:alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
