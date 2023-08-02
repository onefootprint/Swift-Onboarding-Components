#!/bin/bash

set -e

# clean
sh scripts/cleanup.bash
./gradlew clean

# build bundle
./gradlew app:bundleRelease

# build apks file from bundle based on connected device configuration
bundletool build-apks --bundle=app/build/outputs/bundle/release/app-release.aab --connected-device --output=local_app.apks --ks=release.keystore --ks-pass=pass:wS2tDvNsRUWiYkrmfd1JbqDGocKtqUZ4igo --ks-key-alias=key-footprint --key-pass=pass:wS2tDvNsRUWiYkrmfd1JbqDGocKtqUZ4igo