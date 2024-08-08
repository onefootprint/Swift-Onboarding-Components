#!/bin/sh

set -euxo pipefail

tailscale ip && exit 0

authKey="$(aws --region us-east-1 ssm get-parameter --name ${TAILSCALE_AUTH_KEY_SSM_PARAM} --with-decryption | jq -r '.Parameter.Value')"
instanceId="$(cat /run/cloud-init/instance-data.json | jq -r .v1.instance_id)"

tailscale up --authkey "$authKey" --ssh --hostname "${TAILSCALE_HOSTNAME_PREFIX}-$instanceId" --accept-dns=false
