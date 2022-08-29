import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestErrorToast } from 'hooks';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type CreateApiKeyRequest = {
  name: string;
};

export type GetApiKeysResponse = string;

const createApiKey = async (
  authHeaders: AuthHeaders,
  data: CreateApiKeyRequest,
) => {
  const response = await request<GetApiKeysResponse>({
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

  return useMutation<GetApiKeysResponse, RequestError, CreateApiKeyRequest>(
    (data: CreateApiKeyRequest) => createApiKey(authHeaders, data),
    {
      onError: showErrorToast,
      onSettled: () => {
        queryClient.invalidateQueries(['api-keys']);
      },
    },
  );
};

export default useCreateApiKey;
