#!/bin/bash

server_version="x-footprint-server-version: ${GIT_HASH}"
attempt_counter=0
max_attempts=60

echo "Testing server URL: ${TEST_URL}"
# wait until we see the right version
while true
do
    output="$(curl -sv "${TEST_URL}" 2>&1 | grep "x-footprint-server-version")"
    echo "Found server version: ${output}"

    if [[ "${output}" == *"${server_version}"* ]]; then
        echo "success! found ${server_version}"
        exit 0
    fi

    if [ ${attempt_counter} -eq ${max_attempts} ];then
        echo "Max attempts reached"
        exit 1
    fi

    attempt_counter=$(($attempt_counter+1))
    sleep 10
done
