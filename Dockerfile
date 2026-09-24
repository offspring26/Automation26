# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
WORKDIR /workspace/app

COPY app/package*.json ./
RUN npm ci

COPY app/ ./
COPY data/executions.json ./public/executions.json
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/Automation26/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
