import request from '@onefootprint/request';
import {
  ApiKey,
  OrgApiKeyRevealRequest,
  OrgApiKeyRevealResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useUpdateApiKeyCache from './use-update-api-key-cache';

const revealApiKey = async (
  authHeaders: AuthHeaders,
  params: OrgApiKeyRevealRequest,
) => {
  const response = await request<OrgApiKeyRevealResponse>({
    headers: authHeaders,
    method: 'POST',
    url: `/org/api_keys/${params.id}/reveal`,
  });
  return response.data;
};

const useRevealKey = (apiKey: ApiKey) => {
  const updateApiCache = useUpdateApiKeyCache();
  const { authHeaders } = useSession();

  const mutation = useMutation(
    (data: OrgApiKeyRevealRequest) => revealApiKey(authHeaders, data),
    {
      onSuccess: response => {
        updateApiCache(response);
      },
    },
  );

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
