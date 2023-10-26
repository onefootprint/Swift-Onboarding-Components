#!/bin/bash

# Collect FOOTPRINT_PROD_SECRET_API_KEY as a local variable if not in the environment
if [ -z "$FOOTPRINT_PROD_SECRET_API_KEY" ]; then
    read -p "FOOTPRINT_PROD_SECRET_API_KEY is not set. Please enter it: " SECRET_API_KEY
    FOOTPRINT_PROD_SECRET_API_KEY="$SECRET_API_KEY"
fi

# Collect FOOTPRINT_PROD_USER_ID as a local variable if not in the environment
if [ -z "$FOOTPRINT_PROD_USER_ID" ]; then
    read -p "FOOTPRINT_PROD_USER_ID is not set. Please enter it: " USER_ID
    FOOTPRINT_PROD_USER_ID="$USER_ID"
fi

# Generate a random CARD_ALIAS
CARD_ALIAS="card_$(date +%s)"

# Make the curl request
response=$(curl -s "https://api.onefootprint.com/users/$FOOTPRINT_PROD_USER_ID/client_token" \
    -X POST \
    -u "$FOOTPRINT_PROD_SECRET_API_KEY": \
    -d '{
        "scopes": ["vault"],
        "fields": ["card.'"$CARD_ALIAS"'.number", "card.'"$CARD_ALIAS"'.expiration", "card.'"$CARD_ALIAS"'.cvc", "card.'"$CARD_ALIAS"'.billing_address.zip", "card.'"$CARD_ALIAS"'.billing_address.country"],
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

echo "Token: $token"

# Update the .env file
ENV_FILE="../apps/demos/.env"
TMP_FILE="../apps/demos/.env.tmp"
KEY="NEXT_PUBLIC_COMPONENTS_AUTH_TOKEN"

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

