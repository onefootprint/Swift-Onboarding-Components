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
RUN cargo chef prepare --bin api_server --recipe-path recipe.json

#################################
# 3a. Pre-build dependencies    #
#################################
FROM chef AS builder

ARG BUILD_PROFILE

COPY --from=planner /build/recipe.json recipe.json
RUN cargo chef cook --bin api_server --target $(uname -m)-unknown-linux-musl --recipe-path recipe.json \
    $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi)

#################################
# 3b. Build the binary          #
#################################
ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH}

COPY . .
RUN cargo build --bin api_server \
    $(if [ "${BUILD_PROFILE}" = "release" ]; then echo "--release"; else echo ""; fi) && \
    cp ./target/$(uname -m)-unknown-linux-musl/${BUILD_PROFILE}/api_server /usr/bin/api_server

#################################
# 4. Build runtime image        #
#################################
FROM alpine:latest

RUN apk update && apk add curl bind-tools

COPY --from=builder /usr/bin/api_server /usr/bin/api_server

EXPOSE 8000

ENTRYPOINT ["/usr/bin/api_server"]
