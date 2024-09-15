#!/bin/sh

echo "🚀 Initializing sourcemap upload for $SERVICE..."

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

# Source the .env file from the calling directory
if [ -f ".env.local" ]; then
  echo "loaded .env.local"
  . ./.env.local
fi

if [ -z "$SERVICE" ]; then
  echo "Service parameter is required."
  exit 0
fi

if [ -z "$VERCEL_GIT_COMMIT_SHA" ]; then
  echo 'VERCEL_GIT_COMMIT_SHA is not set. Using "unknown" as fallback.'
  VERCEL_GIT_COMMIT_SHA="unknown"
fi

if [ -z "$DATADOG_API_KEY" ]; then
  echo 'DATADOG_API_KEY is not set. Skipping datadog-ci sourcemaps upload.'
  exit 0
fi

datadog-ci sourcemaps upload .next/static --service="$SERVICE" --release-version="${SERVICE}-${VERCEL_GIT_COMMIT_SHA}" --minified-path-prefix=https://$SERVICE.onefootprint.com/_next/static