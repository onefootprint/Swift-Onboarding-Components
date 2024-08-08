#!/bin/sh

while :
do
    STATUS=$(nitro-cli describe-enclaves | jq -r '.[0]["State"]')
    if [ "$STATUS" = "RUNNING" ]; then
        sleep 1
    else
        echo "restarting enclave"
        nitro-cli run-enclave --eif-path /usr/local/share/enclave.eif --cpu-count {{ enclave_cpu_count }} --memory {{ enclave_request_memory_mib }} --enclave-cid 16
        sleep 5
    fi
done
