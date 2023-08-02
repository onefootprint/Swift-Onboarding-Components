#!/bin/bash

set -e

adb uninstall com.onefootprint.my || true

# build instant app
sh scripts/build_instant_app.bash

# unzipping apks file to testing dir
unzip local_app.apks -d testing_locally

# # run instant app from specific split /
ia --debug run testing_locally/instant/*.apk