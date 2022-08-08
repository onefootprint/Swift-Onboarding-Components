import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'hooks';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import type { ApiKey } from 'src/types/api-key';

export type GetApiKeysRequest = {
  authHeaders: AuthHeaders;
};

export type GetApiKeysResponse = ApiKey[];

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
  const { formatDateWithTime } = useIntl();
  const { authHeaders } = useSessionUser();
  return useQuery<GetApiKeysResponse, RequestError>(
    ['api-keys', authHeaders],
    () => getApiKeys({ authHeaders }),
    {
      select: response =>
        response.map((apiKey: ApiKey) => ({
          ...apiKey,
          createdAt: formatDateWithTime(new Date(apiKey.createdAt)),
          lastUsedAt: apiKey.lastUsedAt
            ? formatDateWithTime(new Date(apiKey.lastUsedAt))
            : null,
        })),
    },
  );
};

export default useApiKeys;
