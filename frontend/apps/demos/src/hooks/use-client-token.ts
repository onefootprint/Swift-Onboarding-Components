import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

export type ClientTokenRequest = {
  secretKey: string;
  userId: string;
  cardAlias: string;
  collectName?: boolean;
  collectPartialAddress?: boolean;
};

export type ClientTokenResponse = {
  token: string;
};

const clientToken = async (payload: ClientTokenRequest) => {
  const { secretKey, userId, cardAlias, collectName, collectPartialAddress } = payload;
  const fields = [`card.${cardAlias}.number`, `card.${cardAlias}.cvc`, `card.${cardAlias}.expiration`];
  if (collectName) {
    fields.push(`card.${cardAlias}.name`);
  }
  if (collectPartialAddress) {
    fields.push(`card.${cardAlias}.billing_address.country`);
    fields.push(`card.${cardAlias}.billing_address.zip`);
  }
  const response = await request<ClientTokenResponse>({
    method: 'POST',
    url: `/users/${userId}/client_token`,
    headers: {
      'X-Footprint-Secret-Key': secretKey,
    },
    data: {
      fields,
      scopes: ['vault'],
      ttl: 1800,
    },
  });

  return response.data;
};

const useClientToken = () =>
  useMutation({
    mutationFn: clientToken,
  });

export default useClientToken;
