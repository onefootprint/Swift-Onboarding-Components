#! /bin/sh

name=$(git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')

pulumi stack init --secrets-provider "awskms://4e61ea01-1193-475e-82ee-e9639743efd6?region=us-east-1" --copy-config-from "footprint/dev" "footprint/dev-${name}" || true

pulumi config --stack footprint/dev-${name} set --path constants.domain.prefix "api-${name}."