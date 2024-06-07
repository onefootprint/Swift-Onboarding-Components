ARG RUST_TOOLCHAIN="1.77.0"

#############################
# 1. Install cargo-chef     #
#############################
FROM clux/muslrust:${RUST_TOOLCHAIN}-stable AS chef

RUN apt-get update && apt-get install -y clang

RUN mkdir -p /build
WORKDIR /build
RUN cargo install cargo-chef --version "0.1.67" --locked

#################################
# 2. Plan dependencies to build #
#################################
FROM chef AS planner

COPY . .
RUN cargo chef prepare --bin enclave --recipe-path recipe.json

#################################
# 3a. Pre-build dependencies    #
#################################
FROM chef AS builder

COPY --from=planner /build/recipe.json recipe.json
RUN cargo chef cook --bin enclave --target $(uname -m)-unknown-linux-musl --recipe-path recipe.json

#################################
# 3b. Build the binary          #
#################################
COPY . .
RUN cargo build --bin enclave && \
    cp ./target/$(uname -m)-unknown-linux-musl/debug/enclave /usr/bin/enclave

#################################
# 4. Build runtime image        #
#################################
FROM alpine:latest

RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/bin/enclave /usr/bin/enclave

EXPOSE 5001

ENTRYPOINT ["/usr/bin/enclave"]
