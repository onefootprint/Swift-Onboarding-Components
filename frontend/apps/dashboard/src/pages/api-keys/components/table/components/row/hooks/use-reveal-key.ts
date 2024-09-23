import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { ApiKey, OrgApiKeyRevealRequest, OrgApiKeyRevealResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useUpdateApiKeyCache from './use-update-api-key-cache';

const revealApiKey = async (authHeaders: AuthHeaders, params: OrgApiKeyRevealRequest) => {
  const response = await request<OrgApiKeyRevealResponse>({
    headers: authHeaders,
    method: 'POST',
    url: `/org/api_keys/${params.id}/reveal`,
  });
  return response.data;
};

const useRevealKey = (apiKey: ApiKey) => {
  const updateApiCache = useUpdateApiKeyCache();
  const showRequestError = useRequestErrorToast();
  const { authHeaders } = useSession();

  const mutation = useMutation((data: OrgApiKeyRevealRequest) => revealApiKey(authHeaders, data), {
    onSuccess: response => {
      updateApiCache(response);
    },
    onError: (error: unknown) => {
      showRequestError(error);
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
