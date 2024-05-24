#!/bin/sh

# Parse arguments
SERVICE=""

# Parse options
while getopts ":s:-:" opt; do
  case ${opt} in
    -)
      case "${OPTARG}" in
        service=*)
          SERVICE=${OPTARG#*=}
          ;;
        *)
          echo "Unknown option --${OPTARG}"
          exit 1
          ;;
      esac
      ;;
    s)
      SERVICE=${OPTARG}
      ;;
    \?)
      echo "Invalid option: -${OPTARG}" >&2
      exit 1
      ;;
    :)
      echo "Option -${OPTARG} requires an argument." >&2
      exit 1
      ;;
  esac
done

if [ -z "$SOURCE_MAPS_PUBLIC_STATIC_PATH" ]; then
  echo 'SOURCE_MAPS_PUBLIC_STATIC_PATH is not set. Skipping datadog-ci sourcemaps upload.'
  exit 0
fi


if [ -z "$SERVICE" ]; then
  echo "Service parameter is required."
  exit 0
fi

if [ -z "$DATADOG_API_KEY" ]; then
  echo 'DATADOG_API_KEY is not set. Skipping datadog-ci sourcemaps upload.'
  exit 0
fi

datadog-ci sourcemaps upload ./.next/static --disable-git --service=$SERVICE --release-version=$VERCEL_GIT_COMMIT_SHA --minified-path-prefix=$SOURCE_MAPS_PUBLIC_STATIC_PATH

