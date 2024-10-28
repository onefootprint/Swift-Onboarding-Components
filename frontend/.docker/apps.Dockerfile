FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && apt-get install -y jq git

WORKDIR /frontend

ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV PATH /frontend/node_modules/.bin:$PATH
ENV CI true
ENV API_BASE_URL https://api.dev.onefootprint.com
ENV NEXT_PUBLIC_API_BASE_URL https://api.dev.onefootprint.com
ENV TURBO_TEAM $TURBO_TEAM
ENV TURBO_TOKEN $TURBO_TOKEN

COPY --link styled.d.ts /frontend
COPY --link turbo.json /frontend
COPY --link ./scripts /frontend/scripts
COPY --link ./apps/demos /frontend/apps/demos
COPY --link ./apps/components /frontend/apps/components
COPY --link ./apps/hosted /frontend/apps/hosted
COPY --link ./apps/handoff /frontend/apps/handoff
COPY --link ./apps/auth /frontend/apps/auth
COPY --link ./apps/bifrost /frontend/apps/bifrost
COPY --link ./packages /frontend/packages
COPY --link package.json /frontend
COPY --link pnpm-lock.yaml /frontend
COPY --link pnpm-workspace.yaml /frontend

RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/demos/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/components/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/hosted/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/handoff/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/auth/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/bifrost/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=bifrost... --filter=handoff... --filter=auth... --filter=components... --filter=demos... --filter=hosted...

EXPOSE 3000
EXPOSE 3002
EXPOSE 3004
EXPOSE 3005
EXPOSE 3010
EXPOSE 3011

CMD pnpm turbo run start --filter=bifrost... --filter=handoff... --filter=auth... --filter=components... --filter=demos... --filter=hosted...
