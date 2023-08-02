#!/bin/bash

# Build
sh scripts/build_full_app.bash

# install full app
bundletool install-apks --apks local_app.apks

# run full app
adb shell am start -n com.onefootprint.my/com.onefootprint.my.MainActivity