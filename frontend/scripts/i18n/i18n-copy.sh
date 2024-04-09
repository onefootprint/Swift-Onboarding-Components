#!/bin/bash

get_local_sources() {
    local sources=()
    local language="$1"

    # Copy from main location
    for ns_file in ./src/config/locales/"${language}"/*.json; do
        if [ -f "$ns_file" ]; then
            sources+=("$ns_file")
        fi
    done

    local sourcesString=""
    for src in "${sources[@]}"; do
        sourcesString+="$src "
    done

    echo "$sourcesString"
}

get_external_package_sources() {
    local sources=()
    local language="$1"
    local -a deps=("${!2}")  # Receive deps as an array

    for dep in "${deps[@]}"; do
        if [ -n "$dep" ]; then
            for ns_file in ../../packages/"${dep}"/src/config/locales/"${language}"/*.json; do
                if [ -f "$ns_file" ]; then
                    sources+=("$ns_file")
                fi
            done
        fi
    done

    local sourcesString=""
    for src in "${sources[@]}"; do
        sourcesString+="$src "
    done

    echo "$sourcesString"
}

# Parse command line arguments
declare -a languages  # Declare languages as an array
declare -a deps       # Declare deps as an array
watch_flag=""

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -lng|--language)
        IFS=',' read -r -a temp_langs <<< "$2"
        languages+=("${temp_langs[@]}")
        shift # past argument
        shift # past value
        ;;
        -dep|--dependency)
        IFS=',' read -r -a temp_deps <<< "$2"
        deps+=("${temp_deps[@]}")
        shift # past argument
        shift # past value
        ;;
        --watch)
        watch_flag="--watch"
        shift # past argument
        ;;
        *)
        shift # past unknown argument
        ;;
    esac
done

# Find languages if not specified
if [ ${#languages[@]} -eq 0 ]; then
    for lng_dir in ./src/config/locales/*/; do
        if [ -d "$lng_dir" ]; then
            languages+=("$(basename "$lng_dir")")
        fi
    done
fi

declare -a all_commands # Array to store all commands

# Populate commands for each language
for language in "${languages[@]}"; do
    local_sources=$(get_local_sources "$language")
    external_sources=$(get_external_package_sources "$language" deps[@])
    if [ -n "$local_sources" ] || [ -n "$external_sources" ]; then
        all_commands+=("copy-and-watch ${watch_flag} ${local_sources} ${external_sources} public/locales/${language}/")
    fi
done

# Execute copying tasks
concatenator="&&"
[ -n "$watch_flag" ] && concatenator="&"

# Build the final command string with appropriate concatenation
final_command=""
for cmd in "${all_commands[@]}"; do
    [ -n "$final_command" ] && final_command+=" $concatenator "
    final_command+="$cmd"
done

echo "Executing command: $final_command"

# Execute the commands
eval "rm -rf public/locales/${language}/"
eval "$final_command"
