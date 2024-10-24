#!/bin/bash

# OpenAPI specification file locations
ORIGINAL_SPEC_FILE="../../../../../scripts/openapi/hosted-openapi.json"
SPEC_FILE="./openapi.json"
OUTPUT_DIR="./generated"
FINAL_DIR="./OnboardingComponents/Client"

# Copy the OpenAPI spec file
cp "$ORIGINAL_SPEC_FILE" "$SPEC_FILE"

# Check if the copied OpenAPI spec file exists
if [ ! -f "$SPEC_FILE" ]; then
    echo "Error: OpenAPI specification file not found at $SPEC_FILE"
    exit 1
fi

# Clean up
rm -rf $FINAL_DIR

# Generate Swift code
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
    -i /local/$SPEC_FILE \
    -g swift6 \
    -o /local/$OUTPUT_DIR

# Create final directory structure
mkdir -p $FINAL_DIR
cp -R $OUTPUT_DIR/Sources/OpenAPIClient/*  $FINAL_DIR/

# Clean up
rm -rf $OUTPUT_DIR
rm $SPEC_FILE

echo "Swift client generated successfully in $FINAL_DIR"
