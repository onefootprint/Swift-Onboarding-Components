DIR=$PWD
CLI_PATH=../../node_modules/react-native/local-cli/cli.js
PROJECT_NAME=verify
FRAMEWORK_NAME=FootprintIOS
OUT_BUILD_DIR=$DIR/ios/build
OUT_FW_DIR=$DIR/ios/sdk/Frameworks
INTEGRATION_MODULE_FOLDER=ios/sdk/Resources
BUNDLE_NAME=fk.jsbundle


# We have two podfiles, one for local development and one for building the framework
# The build podfile excludes all the react-native dependencies and uses the local
# react-native dependency instead. This is because the react-native dependency is
# not available on the public podspec repo.
cd ios
cp Podfile-build Podfile
pod deintegrate
pod install
cd ..

rm -rf $OUT_BUILD_DIR
rm -rf $OUT_FW_DIR

if [ -d "${INTEGRATION_MODULE_FOLDER}" ]; then
  rm -rf $INTEGRATION_MODULE_FOLDER
fi
mkdir $INTEGRATION_MODULE_FOLDER

# Create bundle (js file)
node $CLI_PATH ram-bundle \
  --entry-file ./index.js \
  --platform ios \
  --dev false \
  --bundle-output $INTEGRATION_MODULE_FOLDER/$BUNDLE_NAME \
  --assets-dest $INTEGRATION_MODULE_FOLDER

# Remove json files
find $INTEGRATION_MODULE_FOLDER -name "*.json" -type f -delete

SIMULATOR_ARCHIVE_PATH=$OUT_BUILD_DIR/${FRAMEWORK_NAME}-iphonesimulator.xcarchive
DEVICE_ARCHIVE_PATH=$OUT_BUILD_DIR/${FRAMEWORK_NAME}-iphoneos.xcarchive

# Simulator xcarchieve
xcodebuild archive \
  -workspace ios/${PROJECT_NAME}.xcworkspace \
  -scheme ${FRAMEWORK_NAME} \
  -archivePath ${SIMULATOR_ARCHIVE_PATH} \
  -configuration Release \
  -sdk iphonesimulator \
  SKIP_INSTALL=NO \
  BUILD_LIBRARIES_FOR_DISTRIBUTION=YES \
  clean build

# Device xcarchieve
xcodebuild archive \
  -workspace ios/${PROJECT_NAME}.xcworkspace \
  -scheme ${FRAMEWORK_NAME} \
  -archivePath ${DEVICE_ARCHIVE_PATH} \
  -sdk iphoneos \
  -configuration Release \
  SKIP_INSTALL=NO \
  BUILD_LIBRARIES_FOR_DISTRIBUTION=YES \
  clean build

cd $SIMULATOR_ARCHIVE_PATH/Products/Library/Frameworks
for framework in *; do
  frameworkName=${framework//.framework/}
  xcodebuild -create-xcframework \
    -framework $SIMULATOR_ARCHIVE_PATH/Products/Library/Frameworks/$frameworkName.framework \
    -framework $DEVICE_ARCHIVE_PATH/Products/Library/Frameworks/$frameworkName.framework \
    -output $OUT_FW_DIR/$frameworkName.xcframework
done


# Install again the pods to run locally
cd ios
cp Podfile-local Podfile
pod deintegrate
pod install
cd ..