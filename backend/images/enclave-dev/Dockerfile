ARG RUST_TOOLCHAIN="1.77.0"

FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS builder

RUN apt-get update && apt-get install -y clang

RUN mkdir -p /build
WORKDIR /build

ENV CARGO_INCREMENTAL=0
RUN --mount=type=bind,src=.,target=/build,readwrite \
    --mount=type=cache,target=/build/target \
    --mount=type=cache,target=/root/.cargo/registry  \
    cargo build -p enclave && \
    cp ./target/$(uname -m)-unknown-linux-musl/debug/enclave /usr/local/bin/enclave


#################################
# Runtime Image                 #
#################################
FROM alpine:latest

RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/local/bin/enclave /usr/local/bin/enclave

EXPOSE 5001

ENTRYPOINT ["/usr/local/bin/enclave"]
