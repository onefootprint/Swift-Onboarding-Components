import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestErrorToast } from 'hooks';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { OrgCreateApiKeyRequest, OrgCreateApiKeysResponse } from 'types';

const createApiKey = async (
  authHeaders: AuthHeaders,
  data: OrgCreateApiKeyRequest,
) => {
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
  const { authHeaders } = useSessionUser();
  const queryClient = useQueryClient();

  return useMutation<
    OrgCreateApiKeysResponse,
    RequestError,
    OrgCreateApiKeyRequest
  >((data: OrgCreateApiKeyRequest) => createApiKey(authHeaders, data), {
    onError: showErrorToast,
    onSettled: () => {
      queryClient.invalidateQueries(['api-keys']);
    },
  });
};

export default useCreateApiKey;
