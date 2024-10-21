#!/bin/bash

# The file to copy (hardcoded)
file_to_copy="./hosted-openapi.json"

# Array of target directories
target_dirs=("")

# Check if the source file exists
if [ ! -f "$file_to_copy" ]; then
    echo "Error: File '$file_to_copy' not found in the current directory."
    exit 1
fi

# Loop through each target directory
for dir in "${target_dirs[@]}"; do
    # Check if the target directory exists
    if [ ! -d "$dir" ]; then
       echo "Error: Dir '$dir' does not exist"
       exit 1
    fi

    target_file="$dir/openapi.json"

    # Remove write protection if the file exists
    if [ -f "$target_file" ]; then
        chmod 644 "$target_file"
    fi

    # Copy the file to the target directory with the name 'openapi'
    cp "$file_to_copy" "$target_file"

    # Make the copied file read-only and immutable
    chmod 444 "$target_file"
    chattr +i "$target_file"

    echo "Copied '$file_to_copy' to '$target_file' and made it read-only."
done

echo "Operation completed."
