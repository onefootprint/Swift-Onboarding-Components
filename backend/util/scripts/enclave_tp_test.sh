#!/bin/bash

BASE_URL="https://api-ag-fix-enclave-crash.dev.onefootprint.com"
KEY="sk_test_dMB8bfelojjn8VNlNWWoHDfYpvJUH2A3uF"
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

#    curl -u sk_test_LuopYFDtvBV9RviA5WwWCi1t58qriWNNuR: -X POST "https://api.dev.onefootprint.com/users/fp_id_5wK4BKahbOR6GnBbu9HJjY/custom/decrypt" -d '{"reason": "test", "fields": ["ach_account_number", "cc4"]}' &

#     curl -u sk_test_HCv21a7qz4VXueDl4CAjjOJddHsxxf5dIl: -X POST https://api.onefootprint.com/users/fp_id_3FrUm3aB6x5sZgjlKXPqgx/custom/decrypt -d '{ "fields": ["x"], "reason": "y"}' &