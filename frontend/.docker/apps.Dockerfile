FROM node:20-slim
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable
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
COPY --link ./apps/handoff /frontend/apps/handoff
COPY --link ./apps/auth /frontend/apps/auth
COPY --link ./apps/bifrost /frontend/apps/bifrost
COPY --link ./packages /frontend/packages
COPY --link package.json /frontend
COPY --link yarn.lock /frontend

RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/demos/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/components/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/handoff/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/auth/package.json
RUN sed -i 's/"build": "next build"/"build": "next build --no-lint"/g' /frontend/apps/bifrost/package.json

# # This section is for pnpm, which requires different approach for overrides and resolutions
# COPY --link pnpm-workspace.yaml /frontend
# RUN sed -i 's/"packageManager": "yarn@1.22.15"/"packageManager": "pnpm@9.0.6"/g' /frontend/package.json
# RUN jq 'del(.overrides)' /frontend/package.json > /frontend/temp.json && mv /frontend/temp.json /frontend/package.json
# RUN jq 'del(.resolutions)' /frontend/package.json > /frontend/temp.json && mv /frontend/temp.json /frontend/package.json
# # Replacing "*" with "workspace:*"
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/apps/auth/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/apps/bifrost/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/apps/components/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/apps/demos/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/apps/handoff/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/appearance/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/components/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/global-constants/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/hooks/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/icons/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/idv/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/request/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/test-utils/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/types/package.json
# RUN sed -i 's/"\([^"]*\)": "\*"/"\1": "workspace:\*"/g' /frontend/packages/ui/package.json

# RUN pnpm install
RUN yarn install --pure-lockfile
RUN yarn turbo run build --filter=bifrost... --filter=handoff... --filter=auth... --filter=components... --filter=demos...

EXPOSE 3000 
EXPOSE 3002
EXPOSE 3005
EXPOSE 3010
EXPOSE 3011

CMD yarn turbo run start --filter=bifrost... --filter=handoff... --filter=auth... --filter=components... --filter=demos...
