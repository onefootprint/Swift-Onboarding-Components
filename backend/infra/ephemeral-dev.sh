#!/bin/sh

set -euf pipefail

name=$(git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')

pulumi stack init --secrets-provider "awskms://4e61ea01-1193-475e-82ee-e9639743efd6?region=us-east-1" --copy-config-from "dev" "dev-${name}" || true
cp Pulumi.dev.yaml "Pulumi.dev-${name}.yaml"

# Replace the stack name
pulumi config --stack dev-${name} set --path constants.domain.prefix "api-${name}."
