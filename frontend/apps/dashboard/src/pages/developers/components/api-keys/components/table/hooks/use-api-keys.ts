import { useIntl } from '@onefootprint/hooks';
import request, {
  PaginatedRequestResponse,
  RequestError,
} from '@onefootprint/request';
import { ApiKey } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import take from 'lodash/take';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type GetApiKeysRequest = {
  authHeaders: AuthHeaders;
};

export type GetApiKeysResponse = ApiKey[];

const getApiKeys = async ({ authHeaders }: GetApiKeysRequest) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetApiKeysResponse>
  >({
    method: 'GET',
    url: '/org/api_keys',
    headers: authHeaders,
  });
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
        take(response, 10).map((apiKey: ApiKey) => ({
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
