#!/bin/bash

mode=$1
echo "building $1"
docker run -v "cargo-cache:/root/.cargo/registry" -v "$PWD:/volume" --rm -it clux/muslrust:stable cargo build --bin footprint-core $mode
