
# Build the enclave builder

```shell
RUST_VERSION="1.64.0" docker build -t ne_builder2 \
        --build-arg USER=$(whoami) \
        --build-arg USER_ID=$(id -u) \
        --build-arg GROUP_ID=$(id -g) \
        --build-arg RUST_TOOLCHAIN="${RUST_VERSION}" \
        --build-arg CTR_HOME="/home/ec2-user" \
        -f enclave_build.dockerfile \
        .
```