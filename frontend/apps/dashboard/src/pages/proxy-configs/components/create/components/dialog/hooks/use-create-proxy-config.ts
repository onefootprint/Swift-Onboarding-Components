import request, { getErrorMessage } from '@onefootprint/request';
import type { CreateProxyConfigRequest, CreateProxyConfigResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const createProxyConfig = async (authHeaders: AuthHeaders, payload: CreateProxyConfigRequest) => {
  const response = await request<CreateProxyConfigResponse>({
    method: 'POST',
    url: '/org/proxy_configs',
    headers: authHeaders,
    data: payload,
  });

  return response.data;
};

const useCreateProxyConfig = () => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'notifications.create',
  });
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProxyConfigRequest) => createProxyConfig(session.authHeaders, payload),
    onError: (error: unknown) => {
      toast.show({
        title: t('error.title'),
        description: getErrorMessage(error),
        variant: 'error',
      });
    },
    onSuccess: (response: CreateProxyConfigResponse) => {
      toast.show({
        title: t('success.title'),
        description: t('success.description', { name: response.name }),
      });
      queryClient.invalidateQueries();
    },
  });
};

export default useCreateProxyConfig;
