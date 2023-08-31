FROM alpine:latest
RUN apk update && apk add curl bind-tools

COPY ./out/api_server /api_server

EXPOSE 8000

ENTRYPOINT ["/api_server"]                                                     