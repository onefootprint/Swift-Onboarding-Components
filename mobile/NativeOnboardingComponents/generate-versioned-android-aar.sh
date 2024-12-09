#!/bin/bash

# Get the version dynamically from the printVersion task first
VERSION=$(./gradlew -q printVersion)

# Check if the version is set
if [ -z "$VERSION" ]; then
  echo "Error: Version is not defined."
  exit 1
fi

# Print the version for debugging purposes
echo "Version found: ${VERSION}"

# Clean the build
echo "Cleaning the build..."
./gradlew clean

# Build the project
echo "Building the project..."
./gradlew build

# Copy the AAR file with the version
echo "Copying the AAR file..."
cp ./shared/build/outputs/aar/shared-release.aar ./binaries/shared-release-${VERSION}.aar

echo "AAR file has been copied with version ${VERSION}"
