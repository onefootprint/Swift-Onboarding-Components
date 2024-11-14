#!/bin/bash

# Exit the script immediately if any command fails
set -e

# Set directory paths for the binary and Package.swift file
BINARY_DIR="./binaries"
XC_FRAMEWORK_DIR="./shared/build/XCFrameworks/release"
XC_FRAMEWORK_NAME="SwiftOnboardingComponentsShared.xcframework"
ZIP_NAME="SwiftOnboardingComponentsShared.xcframework.zip"
PACKAGE_SWIFT_PATH="./SwiftOnboardingComponentsInternal/Package.swift"
XC_FRAMEWORK_PATH="$BINARY_DIR/$XC_FRAMEWORK_NAME"
ZIP_PATH="$BINARY_DIR/$ZIP_NAME"

# Step 1: Ensure the binaries directory exists
if [ ! -d "$BINARY_DIR" ]; then
    echo "Creating directory: $BINARY_DIR"
    mkdir -p "$BINARY_DIR"
fi

# Step 2: Assemble the Swift XCFramework using Gradle
echo "Assembling SwiftOnboardingComponentsShared XCFramework..."
./gradlew :shared:assembleSwiftOnboardingComponentsSharedXCFramework

# Step 3: Copy the generated XCFramework to the binaries directory
echo "Copying the XCFramework to $BINARY_DIR..."
cp -r "$XC_FRAMEWORK_DIR/$XC_FRAMEWORK_NAME" "$BINARY_DIR"

# Step 4: Create a ZIP file from the XCFramework
echo "Zipping the XCFramework..."
zip -r "$ZIP_PATH" "$XC_FRAMEWORK_PATH"

# Step 5: Compute the checksum of the newly created ZIP file
echo "Computing checksum for the binary..."
CHECKSUM=$(swift package compute-checksum "$ZIP_PATH")

# Step 6: Check if the checksum was successfully computed
if [ -z "$CHECKSUM" ]; then
    echo "Error: Failed to compute checksum for $ZIP_PATH"
    exit 1
fi

# Step 7: Update the checksum in the Package.swift file
echo "Updating checksum in $PACKAGE_SWIFT_PATH..."
sed -i.bak "s/\(checksum: \)[^ ]*/\1\"$CHECKSUM\"/" "$PACKAGE_SWIFT_PATH"

# Step 8: Remove the backup file created by sed
rm "$PACKAGE_SWIFT_PATH.bak"

# Final output
echo "Checksum successfully updated in $PACKAGE_SWIFT_PATH"