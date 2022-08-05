import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import type { ApiKey } from 'src/types/api-key';

import useUpdateApiKeyCache from './use-update-api-key-cache';

export type RevealApiKeyRequest = {
  id: string;
};

export type GetApiKeysResponse = ApiKey;

const revealApiKey = async (
  authHeaders: AuthHeaders,
  params: RevealApiKeyRequest,
) => {
  const { data: response } = await request<RequestResponse<GetApiKeysResponse>>(
    {
      headers: authHeaders,
      method: 'GET',
      url: `/org/api_keys/${params.id}/reveal`,
    },
  );
  return response.data;
};

const useRevealKey = (apiKey: ApiKey) => {
  const updateApiCache = useUpdateApiKeyCache();
  const { authHeaders } = useSessionUser();

  const mutation = useMutation<
    GetApiKeysResponse,
    RequestError,
    RevealApiKeyRequest
  >((data: RevealApiKeyRequest) => revealApiKey(authHeaders, data), {
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
