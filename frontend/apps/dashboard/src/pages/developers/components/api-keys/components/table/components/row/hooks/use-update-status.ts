import { useMutation, useQueryClient } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import type { ApiKey } from 'src/types/api-key';

export type UpdateApiKeyRequest = ApiKey;

export type GetApiKeysResponse = ApiKey;

const updateApiKey = async (
  authHeaders: AuthHeaders,
  params: UpdateApiKeyRequest,
) => {
  const { data: response } = await request<RequestResponse<GetApiKeysResponse>>(
    {
      headers: authHeaders,
      method: 'PATCH',
      url: `/org/api_keys/${params.id}`,
      data: {
        status: params.status,
      },
    },
  );
  return response.data;
};

const useUpdateStatus = (apiKey: ApiKey) => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSessionUser();

  const mutation = useMutation<
    GetApiKeysResponse,
    RequestError,
    UpdateApiKeyRequest
  >((data: UpdateApiKeyRequest) => updateApiKey(authHeaders, data), {
    onMutate: async updatedApiKey => {
      await queryClient.cancelQueries(['api-keys']);
      const previousApiKeys: ApiKey[] | undefined = queryClient.getQueryData([
        'api-keys',
      ]);
      queryClient.setQueryData(['api-keys'], () => {
        const apiKeys = previousApiKeys?.map(_apiKey => {
          if (_apiKey.id === updatedApiKey.id) {
            return updatedApiKey;
          }
          return _apiKey;
        });
        return apiKeys;
      });
      return { previousApiKeys };
    },
    onError: (err, updatedApiKey, context: any) => {
      if (context.previousApiKeys) {
        queryClient.setQueryData(
          ['api-keys', authHeaders],
          context.previousApiKeys,
        );
      }
    },
  });

  const toggle = () => {
    if (apiKey.status === 'enabled') {
      mutation.mutate({ ...apiKey, status: 'disabled' });
    } else {
      mutation.mutate({ ...apiKey, status: 'enabled' });
    }
  };

  return {
    toggle,
    mutation,
  };
};

export default useUpdateStatus;
