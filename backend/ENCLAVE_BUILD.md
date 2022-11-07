
# Build the enclave builder

> TODO: make this auto-update if rust version changes. Currently need to run this manually on @nitro-devbox!


```shell
export RUST_VERSION="1.65.0"

docker build -t ne_builder2 \
        --build-arg USER=$(whoami) \
        --build-arg USER_ID=$(id -u) \
        --build-arg GROUP_ID=$(id -g) \
        --build-arg RUST_TOOLCHAIN="${RUST_VERSION}" \
        --build-arg CTR_HOME="/home/ec2-user" \
        -f enclave_build.dockerfile \
        .
```