#!/bin/bash

BASE_URL="https://api-ag-fix-enclave-crash.dev.onefootprint.com"
KEY="REDACTED_API_KEY"
FP_ID="fp_id_aFxQ0KHltJOg3HHP8B1p3"

for i in {1..1000}
do
    curl -u "${KEY}": \
        -X POST "${BASE_URL}/users/${FP_ID}/decrypt" \
        -d '{"reason": "test", "fields": ["id.first_name", "id.ssn9", "custom.ach_account_number", "custom.cc4"]}' &

    pids[${i}]=$!
done

# wait for all pids
for pid in ${pids[*]}; do
    wait $pid
done

#    curl -u REDACTED_API_KEY: -X POST "https://api.dev.onefootprint.com/users/fp_id_5wK4BKahbOR6GnBbu9HJjY/custom/decrypt" -d '{"reason": "test", "fields": ["ach_account_number", "cc4"]}' &

#     curl -u REDACTED_API_KEY: -X POST https://api.onefootprint.com/users/fp_id_3FrUm3aB6x5sZgjlKXPqgx/custom/decrypt -d '{ "fields": ["x"], "reason": "y"}' &
