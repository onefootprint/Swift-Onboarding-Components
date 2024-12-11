#!/bin/bash

# Clean and build the project
echo "Starting clean and build process..."
./gradlew clean build

# Assemble release version of the 'shared' module
echo "Assembling release version of 'shared' module..."
./gradlew :shared:assembleRelease

# Publish the AAR to the local Maven repository
echo "Publishing AAR to the local Maven repository..."
./gradlew publish

# Optional: Success message
echo "Build and publish completed successfully!"
