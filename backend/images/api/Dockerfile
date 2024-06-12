ARG RUST_TOOLCHAIN="1.77.0"

FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS builder

RUN apt-get update && apt-get install -y clang

RUN mkdir -p /build
WORKDIR /build

ARG BUILD_PROFILE="debug"
ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH}

ENV CARGO_INCREMENTAL=0
RUN --mount=type=bind,src=.,target=/build,readwrite \
    --mount=type=cache,target=/build/target \
    --mount=type=cache,target=/root/.cargo/registry  \
    cargo build -p api_server \
    $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi) && \
    cp ./target/$(uname -m)-unknown-linux-musl/${BUILD_PROFILE}/api_server /usr/local/bin/api_server


#################################
# Runtime Image                 #
#################################
FROM alpine:latest

RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/local/bin/api_server /usr/local/bin/api_server

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/api_server"]
