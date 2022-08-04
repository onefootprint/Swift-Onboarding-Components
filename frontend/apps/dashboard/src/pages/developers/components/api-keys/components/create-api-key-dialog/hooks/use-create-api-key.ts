import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRequestErrorToast, useTranslation } from 'hooks';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { useToast } from 'ui';

export type CreateApiKeyRequest = {
  name: string;
};

export type GetApiKeysResponse = string;

const createApiKey = async (
  authHeaders: AuthHeaders,
  data: CreateApiKeyRequest,
) => {
  const { data: response } = await request<RequestResponse<GetApiKeysResponse>>(
    {
      data,
      headers: authHeaders,
      method: 'POST',
      url: '/org/api_keys',
    },
  );
  return response.data;
};

const useCreateApiKey = () => {
  const toast = useToast();
  const { t } = useTranslation('pages.developers.api-keys.create.feedback');
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSessionUser();
  const queryClient = useQueryClient();

  return useMutation<GetApiKeysResponse, RequestError, CreateApiKeyRequest>(
    (data: CreateApiKeyRequest) => createApiKey(authHeaders, data),
    {
      onSuccess: () => {
        toast.show({
          description: t('success.description'),
          title: t('success.title'),
        });
        queryClient.invalidateQueries(['api-keys']);
      },
      onError: showErrorToast,
    },
  );
};

export default useCreateApiKey;
