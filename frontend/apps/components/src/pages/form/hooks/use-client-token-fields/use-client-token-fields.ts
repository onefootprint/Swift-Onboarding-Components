import { requestWithoutCaseConverter } from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

type ClientTokenFieldsRequest = {
  authToken: string;
};

type ClientTokenFieldsResponse = {
  vault_fields: string[];
  expires_at: Date;
};

const clientTokenFields = async (request: ClientTokenFieldsRequest) => {
  const { authToken } = request;
  const { data: response } = await requestWithoutCaseConverter<ClientTokenFieldsResponse>({
    headers: {
      [AUTH_HEADER]: authToken,
    },
    method: 'GET',
    url: '/entities/client_token',
  });

  return {
    vaultFields: response.vault_fields,
    expiresAt: new Date(response.expires_at),
  };
};

const useClientTokenFields = (authToken?: string) =>
  useQuery(['client-token-fields', authToken], () => clientTokenFields({ authToken: authToken ?? '' }), {
    enabled: !!authToken,
  });

export default useClientTokenFields;
