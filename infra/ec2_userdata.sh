#!/bin/bash

echo ECS_CLUSTER={CLUSTER_NAME} >> /etc/ecs/ecs.config

sudo yum update -y
sudo amazon-linux-extras install -y aws-nitro-enclaves-cli
sudo yum install aws-nitro-enclaves-cli-devel -y
sudo usermod -aG ne $USER

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 800859428444.dkr.ecr.us-east-1.amazonaws.com

mkdir -p image
docker run --rm -v $(pwd)/image:/shared 800859428444.dkr.ecr.us-east-1.amazonaws.com/enclave_pkg:latest

nitro-cli run-enclave --eif-path ./image/enclave.eif --cpu-count 2 --memory 256 --enclave-cid 16