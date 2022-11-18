#! /bin/sh

name=$(git rev-parse --abbrev-ref HEAD | sed -r 's/\//-/g' | sed -r 's/_/-/g')
pulumi stack select footprint/dev-${name}
cp Pulumi.dev.yaml Pulumi.dev-${name}.yaml
pulumi config --stack footprint/dev-${name} set --path constants.domain.prefix "api-${name}."
