import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'hooks';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type GetApiKeysRequest = {
  authHeaders: AuthHeaders;
};

export type ApiKey = {
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string | null;
  lastUsedAt: string | null;
  name: string;
  status: 'enabled';
};

export type EnhancedApiKey = ApiKey & {
  isDecrypted: boolean;
};

export type GetApiKeysResponse = ApiKey[];

export type GetApiKeysResponseTransformed = EnhancedApiKey[];

const getApiKeys = async ({ authHeaders }: GetApiKeysRequest) => {
  const { data: response } = await request<RequestResponse<GetApiKeysResponse>>(
    {
      method: 'GET',
      url: '/org/api_keys',
      headers: authHeaders,
    },
  );
  return response.data;
};

const useApiKeys = () => {
  const format = useIntl();
  const { authHeaders } = useSessionUser();
  return useQuery<
    GetApiKeysResponse,
    RequestError,
    GetApiKeysResponseTransformed
  >(['api-keys', authHeaders], () => getApiKeys({ authHeaders }), {
    select: response =>
      response.map((apiKey: ApiKey) => ({
        ...apiKey,
        isDecrypted: false,
        createdAt: format(apiKey.createdAt, 'date-with-time'),
        lastUsedAt: apiKey.lastUsedAt
          ? format(apiKey.lastUsedAt, 'date-with-time')
          : null,
      })),
  });
};

export default useApiKeys;
