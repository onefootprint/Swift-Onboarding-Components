import request from '@onefootprint/request';
import type { ApiKey, OrgApiKeyUpdateRequest, OrgApiKeyUpdateResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateApiKey = async (authHeaders: AuthHeaders, params: OrgApiKeyUpdateRequest) => {
  const response = await request<OrgApiKeyUpdateResponse>({
    headers: authHeaders,
    method: 'PATCH',
    url: `/org/api_keys/${params.id}`,
    data: {
      status: params.status,
    },
  });
  return response.data;
};

const useUpdateStatus = (apiKey: ApiKey) => {
  const queryClient = useQueryClient();
  const { authHeaders } = useSession();

  const mutation = useMutation({
    mutationFn: (data: OrgApiKeyUpdateRequest) => updateApiKey(authHeaders, data),
    onMutate: async updatedApiKey => {
      await queryClient.cancelQueries({ queryKey: ['api-keys', authHeaders] });
      const previousApiKeys = queryClient.getQueryData<ApiKey[]>(['api-keys', authHeaders]);
      queryClient.setQueryData<ApiKey[] | undefined>(['api-keys', authHeaders], oldData => {
        return oldData?.map(_apiKey => (_apiKey.id === updatedApiKey.id ? updatedApiKey : _apiKey));
      });
      return { previousApiKeys };
    },
    onError: (
      _err: Error,
      _updatedApiKey: OrgApiKeyUpdateRequest,
      context: { previousApiKeys?: ApiKey[] } | undefined,
    ) => {
      if (context?.previousApiKeys) {
        queryClient.setQueryData(['api-keys', authHeaders], context.previousApiKeys);
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
