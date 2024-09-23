import { useIntl } from '@onefootprint/hooks';
import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { type RequestError } from '@onefootprint/request';
import type { ApiKey } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import take from 'lodash/take';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export type GetApiKeysRequest = {
  authHeaders: AuthHeaders;
};

export type GetApiKeysResponse = ApiKey[];

const getApiKeys = async ({ authHeaders }: GetApiKeysRequest) => {
  const { data: response } = await request<PaginatedRequestResponse<GetApiKeysResponse>>({
    method: 'GET',
    url: '/org/api_keys',
    headers: authHeaders,
  });
  return response.data;
};

const useApiKeys = () => {
  const { formatDateWithTime } = useIntl();
  const { authHeaders } = useSession();
  return useQuery<GetApiKeysResponse, RequestError>({
    queryKey: ['api-keys', authHeaders],
    queryFn: () => getApiKeys({ authHeaders }),
    select: (response: GetApiKeysResponse) =>
      take(response, 10).map((apiKey: ApiKey) => ({
        ...apiKey,
        createdAt: formatDateWithTime(new Date(apiKey.createdAt)),
        lastUsedAt: apiKey.lastUsedAt ? formatDateWithTime(new Date(apiKey.lastUsedAt)) : null,
      })),
  });
};

export default useApiKeys;
