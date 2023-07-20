import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

export type ClientTokenRequest = {
  secretKey: string;
  userId: string;
  cardAlias: string;
};

export type ClientTokenResponse = {
  token: string;
};

const clientToken = async (payload: ClientTokenRequest) => {
  const { secretKey, userId, cardAlias } = payload;
  const response = await request<ClientTokenResponse>({
    method: 'POST',
    url: `/users/${userId}/client_token`,
    headers: {
      'X-Footprint-Secret-Key': secretKey,
    },
    data: {
      fields: [
        `card.${cardAlias}.number`,
        `card.${cardAlias}.cvc`,
        `card.${cardAlias}.expiration`,
        `card.${cardAlias}.name`,
        `card.${cardAlias}.billing_address.zip`,
        `card.${cardAlias}.billing_address.country`,
      ],
      scopes: ['vault'],
      ttl: 1800,
    },
  });

  return response.data;
};

const useClientToken = () => useMutation(clientToken);

export default useClientToken;
