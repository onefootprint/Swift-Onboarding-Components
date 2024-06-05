# -------- BEGIN NITRO ENCLAVE BUILDER --------

# Copyright 2020-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

# This Docker file sets up the development environment for the eVault components
# that live inside the enclave.
# Note: this is not the container image used to generate the final enclave image,
#       but a somewhat dependency-heavy dev-time environment. The enclave image
#       source container will start from scratch, cherry-picking only its
#       required run-time dependencies from here.

FROM alpine:3.17.3 AS nitro_enclave_builder

ARG RUST_TOOLCHAIN="1.77.0"

# Force Rust dynamic linking against the Alpine-default musl libc.
ENV RUSTFLAGS="-C target-feature=-crt-static"

RUN apk update

# Install system dependencies / packages.
RUN apk add \
    ca-certificates \
    cmake \
    g++ \
    gcc \
    git \
    go \
    perl \
    make \
    linux-headers \
    shadow \
    sudo \
    musl-dev \
    file \
    curl \
    pkgconf \
    openssl-dev \
    automake \
    autoconf \
    libtool

RUN ln -s /usr/lib /usr/lib64

RUN mkdir -p /build
WORKDIR /build

# Build AWS libcrypto
ENV AWS_LC_VER="v1.0.2"
RUN git clone "https://github.com/awslabs/aws-lc.git" \
    && cd aws-lc \
    && git reset --hard $AWS_LC_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build/ --parallel $(nproc) --target crypto \
    && mv build/crypto/libcrypto.so /usr/lib/ \
    && cp -rf include/openssl /usr/include/ \
    && ldconfig /usr/lib

# AWS-S2N
ENV AWS_S2N_VER="v1.3.20"
RUN git clone https://github.com/aws/s2n-tls.git \
    && cd s2n-tls \
    && git reset --hard $AWS_S2N_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build/ --parallel $(nproc) --target install

# AWS-C-COMMON
ENV AWS_C_COMMON_VER="v0.8.0"
RUN git clone https://github.com/awslabs/aws-c-common.git \
    && cd aws-c-common \
    && git reset --hard $AWS_C_COMMON_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build/ --parallel $(nproc) --target install

# AWS-C-SDKUTILS
ENV AWS_C_SDKUTILS_VER="v0.1.2"
RUN git clone https://github.com/awslabs/aws-c-sdkutils \
    && cd aws-c-sdkutils \
    && git reset --hard $AWS_C_SDKUTILS_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build/ --parallel $(nproc) --target install

# AWS-C-CAL
ENV AWS_C_CAL_VER="v0.5.18"
RUN git clone https://github.com/awslabs/aws-c-cal.git \
    && cd aws-c-cal \
    && git reset --hard $AWS_C_CAL_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build --parallel $(nproc) --target install

# AWS-C-IO
ENV AWS_C_IO_VER="v0.11.0"
RUN git clone https://github.com/awslabs/aws-c-io.git \
    && cd aws-c-io \
    && git reset --hard $AWS_C_IO_VER \
    && cmake \
        -DUSE_VSOCK=1 \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build/ --parallel $(nproc) --target install

# AWS-C-COMPRESSION
ENV AWS_C_COMPRESSION_VER="v0.2.14"
RUN git clone http://github.com/awslabs/aws-c-compression.git \
    && cd aws-c-compression \
    && git reset --hard $AWS_C_COMPRESSION_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build --parallel $(nproc) --target install

# AWS-C-HTTP
ENV AWS_C_HTTP_VER="v0.6.19"
RUN git clone https://github.com/awslabs/aws-c-http.git \
    && cd aws-c-http \
    && git reset --hard $AWS_C_HTTP_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build --parallel $(nproc) --target install

# AWS-C-AUTH
ENV AWS_C_AUTH_VER="v0.6.15"
RUN git clone https://github.com/awslabs/aws-c-auth.git \
    && cd aws-c-auth \
    && git reset --hard $AWS_C_AUTH_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build --parallel $(nproc) --target install

# JSON-C library
ENV JSON_C_VER="json-c-0.16-20220414"
RUN git clone https://github.com/json-c/json-c.git \
    && cd json-c \
    && git reset --hard $JSON_C_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build --parallel $(nproc) --target install

# Install Rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain $RUST_TOOLCHAIN

# NSM LIB
ENV AWS_NE_NSM_API_VER="f9422662d02ad089b5132cfcdbe3496365ab4818"
RUN git clone "https://github.com/aws/aws-nitro-enclaves-nsm-api" \
    && cd aws-nitro-enclaves-nsm-api \
    && git reset --hard $AWS_NE_NSM_API_VER \
    && PATH="$PATH:/root/.cargo/bin" cargo build --release -p nsm-lib \
    && mv target/release/libnsm.so /usr/lib/ \
    && mv target/release/nsm.h /usr/include/


# AWS Nitro Enclaves SDK
ENV AWS_NE_SDK_VER="v0.3.2"
RUN git clone "https://github.com/aws/aws-nitro-enclaves-sdk-c" \
    && cd aws-nitro-enclaves-sdk-c \
    && git reset --hard $AWS_NE_SDK_VER \
    && cmake \
        -DCMAKE_PREFIX_PATH=/usr \
        -DCMAKE_INSTALL_PREFIX=/usr \
        -DBUILD_SHARED_LIBS=1 \
        -DBUILD_TESTING=0 \
        -B build \
    && cmake --build build --target install --parallel $(nproc)

ENV RUST_BACKTRACE=full
ENV PATH="/root/.cargo/bin:$PATH"

# -------- END NITRO ENCLAVE BUILDER --------

# -------- BEGIN FOOTPRINT ENCLAVE BUILDER --------
FROM nitro_enclave_builder AS builder

RUN --mount=type=bind,source=.,target=.,readwrite \
    --mount=type=cache,target=./target \
    --mount=type=cache,target=/root/.cargo/registry \
    cargo build -p enclave --no-default-features --features nitro --release && \
    cp ./target/release/enclave /usr/bin/enclave

RUN mkdir -p /rootfs
WORKDIR /rootfs

# Collect eVault lib deps
RUN BINS="\
    /usr/bin/enclave \
    " && \
    for bin in $BINS; do \
        { echo "$bin"; ldd "$bin" | grep -Eo "/.*lib.*/[^ ]+"; } | \
            while read path; do \
                mkdir -p ".$(dirname $path)"; \
                cp -fL "$path" ".$path"; \
                strip --strip-unneeded ".$path"; \
            done \
    done
RUN mkdir -p /rootfs/etc/ssl/certs \
    && cp -f /etc/ssl/certs/ca-certificates.crt /rootfs/etc/ssl/certs/
RUN mkdir -p /rootfs/p11ne

RUN mkdir -p /rootfs/bin/ && \
    cp /rootfs/usr/bin/enclave /rootfs/bin/enclave && \
    chmod +x /rootfs/bin/enclave

RUN find /rootfs

# -------- END FOOTPRINT ENCLAVE BUILDER --------

FROM scratch
COPY --from=builder /rootfs /

ENV RUST_LOG=info

CMD ["/bin/enclave"]

