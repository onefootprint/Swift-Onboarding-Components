
# Build the enclave builder

```shell
docker build -t ne_builder2 \
        --build-arg USER=$(whoami) \
        --build-arg USER_ID=$(id -u) \
        --build-arg GROUP_ID=$(id -g) \
        --build-arg RUST_TOOLCHAIN="1.63.0" \
        --build-arg CTR_HOME="/home/ec2-user" \
        -f enclave_build.dockerfile \
        .
```