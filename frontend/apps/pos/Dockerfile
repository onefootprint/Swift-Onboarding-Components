# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Enable Corepack for Yarn
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder

# overridable envs
ENV REACT_APP_FP_API_URL=APP_FP_API_URL


WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM nginx:alpine AS runner
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# add env.sh to docker-entrypoint.d
COPY env.sh /docker-entrypoint.d/env.sh
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80
USER nobody:nobody
CMD ["nginx", "-g", "daemon off;"]
