ARG RUST_TOOLCHAIN="1.79.0"

FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS builder

RUN apt-get update && apt-get install -y clang

RUN mkdir -p /build
WORKDIR /build

ARG BUILD_PROFILE
ARG CARGO_FEATURES
ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH}

ENV CARGO_INCREMENTAL=0
RUN --mount=type=bind,src=.,target=/build,readwrite \
    --mount=type=cache,target=/build/target \
    --mount=type=cache,target=/root/.cargo/registry  \
    cargo build -p enclave_proxy \
    $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi) \
    --features "${CARGO_FEATURES}" && \
    cp ./target/$(uname -m)-unknown-linux-musl/${BUILD_PROFILE}/enclave_proxy /usr/local/bin/enclave_proxy

#################################
# Runtime Image                 #
#################################

# n.b. In prod, the enclave_proxy binary is copied out of the container and run
# without Docker. This works because the binary is statically linked against
# musl. This image is used for testing and to provide the `cp` binary to copy
# out the enclave_proxy binary in prod.

FROM alpine:latest

RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/local/bin/enclave_proxy /usr/local/bin/enclave_proxy

EXPOSE 3668

ENTRYPOINT ["/usr/local/bin/enclave_proxy"]
