#!/bin/bash

docker run -v "cargo-cache:/root/.cargo/registry" -v "$PWD:/volume" --rm -it clux/muslrust:stable cargo build --bin footprint-core --release
