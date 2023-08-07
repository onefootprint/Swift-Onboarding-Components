#!/bin/bash

# Setting environment variables
export CI=true
export IS_E2E=true
export E2E_BASE_URL=http://localhost:3002
export API_BASE_URL=https://api.dev.onefootprint.com
export NEXT_PUBLIC_API_BASE_URL=https://api.dev.onefootprint.com
export NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyCgSmhug-DYfU5ozUNCyTfKyVX3VvPTSUs
export NEXT_PUBLIC_E2E_TENANT_PK=ob_test_Gw8TsnS2xWOYazI0pugdxu

# Stop web servers
echo "🛑 Stop web servers"
npx kill-port 3000 3002 3005

# Build Bifrost, Handoff and Demos
echo "🔨 Build Bifrost, Handoff and Demos"
yarn build --filter=bifrost... --filter=handoff... --filter=demos...

# Run apps locally, using production mode
echo "🚀 Run apps locally, using production mode"
yarn start --filter=bifrost --filter=handoff --filter=demos &

# Run Playwright tests
echo "🧪 Run Playwright tests"
yarn test:e2e:ci

# Stop web servers after testing
echo "🛑 Stop web servers after testing"
npx kill-port 3000 3002 3005
