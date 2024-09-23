import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { ApiKey, OrgCreateApiKeyRequest, OrgCreateApiKeysResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const createApiKey = async (authHeaders: AuthHeaders, data: OrgCreateApiKeyRequest) => {
  const response = await request<OrgCreateApiKeysResponse>({
    data,
    headers: authHeaders,
    method: 'POST',
    url: '/org/api_keys',
  });
  return response.data;
};

const useCreateApiKey = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation((data: OrgCreateApiKeyRequest) => createApiKey(authHeaders, data), {
    onError: e => {
      showErrorToast(e);
      // Clear out all the results in case the request did create the API key
      queryClient.invalidateQueries(['api-keys', authHeaders]);
    },
    onSuccess: response => {
      // Insert the newly created key into the top of the list. This nicely helps to show the API
      // key value as soon as it is created
      queryClient.setQueryData(['api-keys', authHeaders], (prevApiKeys?: ApiKey[]) =>
        [response].concat(prevApiKeys || []),
      );
    },
  });
};

export default useCreateApiKey;
