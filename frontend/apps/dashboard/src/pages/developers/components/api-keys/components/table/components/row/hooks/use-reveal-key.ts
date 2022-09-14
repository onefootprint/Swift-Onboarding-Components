import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { ApiKey, OrgApiKeyRevealRequest, OrgApiKeyRevealResponse } from 'types';

import useUpdateApiKeyCache from './use-update-api-key-cache';

const revealApiKey = async (
  authHeaders: AuthHeaders,
  params: OrgApiKeyRevealRequest,
) => {
  const response = await request<OrgApiKeyRevealResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/org/api_keys/${params.id}/reveal`,
  });
  return response.data;
};

const useRevealKey = (apiKey: ApiKey) => {
  const updateApiCache = useUpdateApiKeyCache();
  const { authHeaders } = useSessionUser();

  const mutation = useMutation<
    OrgApiKeyRevealResponse,
    RequestError,
    OrgApiKeyRevealRequest
  >((data: OrgApiKeyRevealRequest) => revealApiKey(authHeaders, data), {
    onSuccess: response => {
      updateApiCache(response);
    },
  });

  const show = () => {
    mutation.mutate({ id: apiKey.id });
  };

  const hide = () => {
    updateApiCache({ ...apiKey, key: null });
  };

  const toggle = () => {
    if (apiKey.key) {
      hide();
    } else {
      show();
    }
  };

  return {
    toggle,
    mutation,
  };
};

export default useRevealKey;
