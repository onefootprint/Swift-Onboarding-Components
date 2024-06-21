#!/usr/bin/env bash


set -euxo pipefail

if command -v brew; then
    brew install rage
    exit 0
fi

if command -v dpkg; then
    DEB_AMD64="https://github.com/str4d/rage/releases/download/v0.10.0/rage_0.10.0-1_amd64.deb"
    DEB_AMD64_SHA256="0d418e4054c63e09d31fd687f13361f13b4cca7f96b3671cb83b7a86d0382cb2"

    DEB_ARM64="https://github.com/str4d/rage/releases/download/v0.10.0/rage_0.10.0-1_arm64.deb"
    DEB_ARM64_SHA256="1897b222d754ec790d57e8ae5819fc585ba62107d54bf4bfde5e2b8781ae79ca"

    if [[ $(dpkg --print-architecture) == "amd64" ]]; then
        DEB_URL=$DEB_AMD64
        DEB_SHA256=$DEB_AMD64_SHA256
    else
        DEB_URL=$DEB_ARM64
        DEB_SHA256=$DEB_ARM64_SHA256
    fi

    DEB=$(mktemp)
    wget -O $DEB $DEB_URL
    echo "$DEB_SHA256 $DEB" | sha256sum -c

    sudo dpkg -i $DEB
    rm $DEB

    exit 0
fi

echo "No supported package manager"
exit 1

