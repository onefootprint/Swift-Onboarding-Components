ARG RUST_TOOLCHAIN="1.77.0"

FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS builder

RUN apt-get update && apt-get install -y clang

ARG GIT_HASH
ARG BUILD_PROFILE
ARG CARGO_ARGS
ENV GIT_HASH=${GIT_HASH}

RUN --mount=type=bind,source=.,target=.,readwrite \
    --mount=type=cache,target=./target \
    --mount=type=cache,target=/root/.cargo/registry \
    cargo build -p enclave_proxy \
        $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi) \
        ${CARGO_ARGS} && \
    cp ./target/$(uname -m)-unknown-linux-musl/${BUILD_PROFILE}/enclave_proxy /usr/bin/enclave_proxy

FROM alpine:latest
RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/bin/enclave_proxy /usr/bin/enclave_proxy

EXPOSE 3668

ENTRYPOINT ["/usr/bin/enclave_proxy"]
