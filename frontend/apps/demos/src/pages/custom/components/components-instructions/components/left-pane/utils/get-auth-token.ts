export const getAuthTokenRequest = ({
  secretKey,
  userId,
  cardAlias,
  ttl,
}: {
  secretKey: string;
  userId: string;
  cardAlias: string;
  ttl: number;
}) => `
  curl https://api.onefootprint.com/users/${userId}/client_token \
      -X POST \
      -u ${secretKey}: \
      -d '{
            "fields": [
              "card.${cardAlias}.number",
              "card.${cardAlias}.cvc",
              "card.${cardAlias}.expiration",
              "card.${cardAlias}.billing_address.zip",
              "card.${cardAlias}.billing_address.country"
            ],
            "scopes": [
              "vault"
            ],
            "ttl": ${ttl}
        }'
  `;

export const getAuthTokenResponse = () => `
    {"token":"cttok_joXzzB0kIVW0fMCB7RWPAHWt8itWdFWpit","expires_at":"2023-07-20T03:59:03.579654Z"}
  `;
