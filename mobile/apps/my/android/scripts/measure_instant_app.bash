# Build
sh scripts/build_instant_app.bash

# Measure size of instant bundle - value is returned in bytes
bundletool get-size total --apks=local_app.apks --instant