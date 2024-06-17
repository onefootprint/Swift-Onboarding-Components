FROM ubuntu:22.04 AS rust-builder

ARG RUST_TOOLCHAIN="1.77.0"
ARG DIESEL_VERSION="2.0.0"

RUN mkdir -p /build
WORKDIR /build

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    libssl-dev \
    libpq-dev \
    pkg-config \
    mold \
    clang

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain $RUST_TOOLCHAIN --profile minimal
ENV PATH="${PATH}:/root/.cargo/bin"

ENV CARGO_INCREMENTAL=0

RUN cargo install diesel_cli --version $DIESEL_VERSION --locked --no-default-features --features postgres

RUN --mount=type=bind,src=.,target=/build,readwrite \
    --mount=type=cache,target=/build/target \
    --mount=type=cache,target=/root/.cargo/registry  \
    cargo install --path ./external_tools/footprint-dr

# ----------------------------

FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gnome-keyring \
    groff # Used by AWS CLI

RUN mkdir -p /backend
WORKDIR /backend

COPY ci/requirements.txt /backend/ci/requirements.txt
RUN pip install -r ci/requirements.txt

# Put the copies at the end to improve build pipelining.
COPY --from=rust-builder /root/.cargo/bin/diesel /usr/local/bin/diesel
COPY --from=rust-builder /root/.cargo/bin/footprint-dr /usr/local/bin/footprint-dr

COPY images/integration-tests/localstack-aws-config.toml /root/.aws/config
COPY images/integration-tests/localstack-aws-credentials.toml /root/.aws/credentials
