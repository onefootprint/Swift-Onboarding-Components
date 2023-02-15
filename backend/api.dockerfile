FROM alpine:latest
RUN apk update && apk add curl

COPY ./out/footprint-core /footprint-core

EXPOSE 8000

ENTRYPOINT ["/footprint-core"]                                                     