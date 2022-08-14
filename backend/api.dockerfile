FROM alpine:latest

COPY ./out/footprint-core /footprint-core

EXPOSE 8000

ENTRYPOINT ["/footprint-core"]                                                     