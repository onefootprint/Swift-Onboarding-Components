import request, { type PaginatedRequestResponse } from '@onefootprint/request';
import type { ApiKey } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const DASHBOARD_AUTHORIZATION_HEADER = 'x-fp-dashboard-authorization';
const DASHBOARD_IS_LIVE_HEADER = 'x-is-live';

const getSandboxApiKey = async (authToken: string) => {
  const authHeaders = {
    [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(false),
  };

  const response = await request<PaginatedRequestResponse<ApiKey[]>>({
    method: 'GET',
    url: '/org/api_keys',
    headers: authHeaders,
  });

  const adminKey = response.data.data.filter(key => key.role.isImmutable && key.role.name === 'Admin')[0];
  if (!adminKey) {
    return null;
  }

  const revealResponse = await request<ApiKey>({
    headers: authHeaders,
    method: 'POST',
    url: `/org/api_keys/${adminKey.id}/reveal`,
  });

  return revealResponse.data;
};

const useGetSandboxApiKey = () => {
  const {
    data: { authToken },
  } = useSession();

  return useQuery(['sandboxApiKey', authToken], () => getSandboxApiKey(authToken || ''), {
    enabled: !!authToken,
  });
};

export default useGetSandboxApiKey;
