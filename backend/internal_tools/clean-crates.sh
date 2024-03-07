#!/usr/bin/env bash

# Cleans all first-party crates

set -euf -o pipefail

cargo clean $(cargo metadata --format-version 1 | jq -j -r '.packages[] | select(.source == null) | "-p \(.name) "')
