#!/usr/bin/env bash

set -euxo pipefail

cd components/db/schema

NUM_FILES=`ls migrations | wc -l`
NUM_TO_REVERT=$(( $NUM_FILES < 1 ? $NUM_FILES : 1 ))
echo "Reverting $NUM_TO_REVERT migrations"

for ((i=0; i<$NUM_TO_REVERT; i++))
do
  echo $i
  diesel migration revert
  if [ $? -ne 0 ]; then
    echo "failed to properly revert"
    exit 1
  fi
done

echo "Reverted $NUM_TO_REVERT migrations, running again"

diesel migration run
if [ $? -ne 0 ]; then
  echo "failed to properly restore"
  exit 1
fi
