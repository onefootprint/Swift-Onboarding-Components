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
RUN cargo chef prepare --bin enclave_proxy --recipe-path recipe.json

#################################
# 3a. Pre-build dependencies    #
#################################
FROM chef AS builder

ARG BUILD_PROFILE
ARG CARGO_FEATURES

COPY --from=planner /build/recipe.json recipe.json
RUN cargo chef cook -p enclave_proxy --target $(uname -m)-unknown-linux-musl --recipe-path recipe.json \
    --features "${CARGO_FEATURES}" \
    $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi)

#################################
# 3b. Build the binary          #
#################################
ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH}

COPY . .
RUN cargo build -p enclave_proxy \
    $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi) \
    --features "${CARGO_FEATURES}" && \
    cp ./target/$(uname -m)-unknown-linux-musl/${BUILD_PROFILE}/enclave_proxy /usr/local/bin/enclave_proxy

#################################
# 4. Build runtime image        #
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
