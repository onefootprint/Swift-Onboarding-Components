#!/bin/bash

function getEnv {
  local env='dev'
  if [ -z "$1" ]; then
      read -p "Please enter the environment (dev or prod): " env
  else
      env="$1"
  fi

  if [ "$env" != "dev" ] && [ "$env" != "prod" ]; then
      env="dev"
  fi

  echo "$env"
}

function getUserId {
  local env="$1"
  local userId=""
  if [ "$env" == "dev" ]; then
      if [ -z "$FOOTPRINT_DEV_USER_ID" ]; then
          read -p "FOOTPRINT_DEV_USER_ID is not set. Please enter it: " userId
      else 
          userId="$FOOTPRINT_DEV_USER_ID"
      fi
  else
      if [ -z "$FOOTPRINT_PROD_USER_ID" ]; then
          read -p "FOOTPRINT_PROD_USER_ID is not set. Please enter it: " userId
      else 
          userId="$FOOTPRINT_PROD_USER_ID"
      fi
  fi

  echo "$userId"
}

function getSecretApiKey {
  local env="$1"
  local apiKey=""
  if [ "$env" == "dev" ]; then
      if [ -z "$FOOTPRINT_DEV_SECRET_API_KEY" ]; then
          read -p "FOOTPRINT_DEV_SECRET_API_KEY is not set. Please enter it: " apiKey
      else 
          apiKey="$FOOTPRINT_DEV_SECRET_API_KEY"
      fi
  else
      if [ -z "$FOOTPRINT_PROD_SECRET_API_KEY" ]; then
          read -p "FOOTPRINT_PROD_SECRET_API_KEY is not set. Please enter it: " apiKey
      else 
          apiKey="$FOOTPRINT_PROD_SECRET_API_KEY"
      fi
  fi

  echo "$apiKey"
}


# Collect the environment
ENV=$(getEnv "$1")
echo "Environment: $ENV"

# Collect the user id
USER_ID=$(getUserId "$ENV")
echo "User ID: $USER_ID"

# Collect the secret api key
API_KEY=$(getSecretApiKey "$ENV")
echo "API Key $API_KEY"

# Generate a random CARD_ALIAS
CARD_ALIAS="card_$(date +%s)"

# If env is dev, base url starts with api.dev otherwise with api
if [ "$ENV" == "dev" ]; then
    BASE_URL="https://api.dev.onefootprint.com"
else
    BASE_URL="https://api.onefootprint.com"
fi

# Make the curl request
response=$(curl -s "$BASE_URL/users/$USER_ID/client_token" \
    -X POST \
    -u "$API_KEY": \
    -d '{
        "scopes": ["decrypt"],
        "decrypt_reason": "Render component local dev (belce)",
        "fields": [
          "id.first_name", 
          "id.last_name", 
          "id.ssn4", 
          "id.ssn9", 
          "id.dob", 
          "id.email", 
          "id.phone_number", 
          "card.'"$CARD_ALIAS"'.number", 
          "card.'"$CARD_ALIAS"'.expiration", 
          "card.'"$CARD_ALIAS"'.cvc", 
          "card.'"$CARD_ALIAS"'.billing_address.zip", 
          "card.'"$CARD_ALIAS"'.billing_address.country"
        ],
        "reason": "Form Component Local Dev",
        "ttl": 86400
    }')

# Check if the response contains an error message
if [[ $response == *"curl: "* ]]; then
    echo "Curl request failed. Error message: $response"
    exit 1
fi

# Extract the 'token' value from the JSON response using awk
token=$(echo "$response" | awk -F'"token":' '{print $2}' | awk -F'"' '{print $2}')

# Check if the extraction was successful
if [ -z "$token" ]; then
    echo "Failed to extract the 'token' from the response."
    echo "Curl response:"
    echo "$response"
    exit 1
fi

echo "======================================================"
echo "Token: $token"

# Update the .env file
ENV_FILE="../apps/demos/.env"
TMP_FILE="../apps/demos/.env.tmp"
KEY="DEMO_RENDER_AUTH_TOKEN"

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE does not exist"
  exit 1
fi

if grep -q "$KEY=" "$ENV_FILE"; then
  # Use sed to update the value associated with the key
  sed "s/$KEY=.*/$KEY=\"$token\"/" "$ENV_FILE" > "$TMP_FILE"
  # Replace the original .env file with the temporary file
  mv "$TMP_FILE" "$ENV_FILE"
else
  echo "$KEY=\"$token\"" >> "$ENV_FILE"
fi

