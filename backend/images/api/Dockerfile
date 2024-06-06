ARG RUST_TOOLCHAIN="1.77.0"

FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS builder

RUN apt-get update && apt-get install -y clang

ARG GIT_HASH
ARG BUILD_PROFILE
ENV GIT_HASH=${GIT_HASH}

RUN --mount=type=bind,source=.,target=.,readwrite \
    --mount=type=cache,target=./target \
    --mount=type=cache,target=/root/.cargo/registry \
    cargo build -p api_server \
        $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi) && \
    cp ./target/$(uname -m)-unknown-linux-musl/${BUILD_PROFILE}/api_server /usr/bin/api_server

FROM alpine:latest
RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/bin/api_server /usr/bin/api_server

EXPOSE 8000

ENTRYPOINT ["/usr/bin/api_server"]
