FROM alpine:latest

COPY ./target/x86_64-unknown-linux-musl/release/footprint-core /footprint-core

EXPOSE 8000

ENTRYPOINT ["/footprint-core"]                                                     