#!/bin/sh

set -euxo pipefail

aws ecr get-login-password | docker login --username AWS --password-stdin ${ECR_ENDPOINT}

mkdir -p /tmp/artifacts

# Download the enclave EIF
docker run --rm -v /tmp/artifacts:/tmp/artifacts --entrypoint "sh" ${ENCLAVE_IMAGE} -c "cp /usr/local/share/enclave.eif /tmp/artifacts/enclave.eif"
mv /tmp/artifacts/enclave.eif /usr/local/share/enclave.eif
chown root:root /usr/local/share/enclave.eif

# Download the enclave proxy binary
docker run --rm -v /tmp/artifacts:/tmp/artifacts --entrypoint "sh" ${ENCLAVE_PROXY_IMAGE} -c "cp /usr/local/bin/enclave_proxy /tmp/artifacts/enclave_proxy"
mv /tmp/artifacts/enclave_proxy /usr/local/bin/enclave_proxy
chown root:root /usr/local/bin/enclave_proxy
chmod +x /usr/local/bin/enclave_proxy
