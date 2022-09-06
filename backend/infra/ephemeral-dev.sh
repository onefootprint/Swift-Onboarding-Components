#! /bin/sh

name=$(git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')
cp Pulumi.dev.yaml Pulumi.dev-${name}.yaml
pulumi stack select footprint/dev-${name}
pulumi config --stack footprint/dev-${name} set --path constants.domain.prefix "api-${name}."
