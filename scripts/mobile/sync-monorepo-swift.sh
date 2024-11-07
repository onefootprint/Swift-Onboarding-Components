#!/bin/bash

# Define source and destination paths
SOURCE_DIR="../../mobile/packages/footprint-swift/"
DEST_DIR="../../../footprint-swift/"

# Create array of files to copy
FILES_TO_COPY=(
  "Sources"
  "FootprintSwift.podspec"
  "Package.swift"  
)

# Copy each file/directory
for file in "${FILES_TO_COPY[@]}"; do
  if [ -e "$SOURCE_DIR$file" ]; then
    rsync -av "$SOURCE_DIR$file" "$DEST_DIR"
  else
    echo "Warning: $file not found in source directory"
  fi
done

# Define source and destination paths
SOURCE_DIR="../../mobile/apps/demo-swift/demo-swift/"
DEST_DIR="../../../examples/idv/mobile-swift-ui/mobile-swift-ui/"

# Files to exclude from sync
EXCLUDE_FILES=(
  "demo-swiftDebug.entitlements"
  "demo-swiftRelease.entitlements" 
  "demo_swiftApp.swift"
  "Info.plist"
)

# Build exclude arguments for rsync
EXCLUDE_ARGS=""
for file in "${EXCLUDE_FILES[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$file"
done
 
# Sync files while excluding specified files
if ! rsync -av ${EXCLUDE_ARGS} "$SOURCE_DIR" "$DEST_DIR"; then
  echo "Error: Failed to sync files"
  exit 1
fi
