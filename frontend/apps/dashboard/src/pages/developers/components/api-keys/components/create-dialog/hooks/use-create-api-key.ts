import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import {
  OrgCreateApiKeyRequest,
  OrgCreateApiKeysResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

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
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation(
    (data: OrgCreateApiKeyRequest) => createApiKey(authHeaders, data),
    {
      onError: showErrorToast,
      onSettled: () => {
        queryClient.invalidateQueries(['api-keys', authHeaders]);
      },
    },
  );
};

export default useCreateApiKey;
