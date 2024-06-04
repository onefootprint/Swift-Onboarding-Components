ARG RUST_TOOLCHAIN="1.77.0"

FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS builder

RUN --mount=type=bind,source=.,target=.,readwrite \
    --mount=type=cache,target=./target \
    --mount=type=cache,target=/root/.cargo/registry \
    cargo build -p enclave && \
    cp ./target/$(uname -m)-unknown-linux-musl/debug/enclave /usr/bin/enclave

FROM alpine:latest
RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/bin/enclave /usr/bin/enclave

EXPOSE 5000

ENTRYPOINT ["/usr/bin/enclave"]
