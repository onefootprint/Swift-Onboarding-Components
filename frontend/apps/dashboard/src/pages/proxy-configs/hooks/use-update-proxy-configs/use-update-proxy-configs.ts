import request, { getErrorMessage } from '@onefootprint/request';
import type { UpdateProxyConfigRequest } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateProxyConfig = async (authHeaders: AuthHeaders, payload: UpdateProxyConfigRequest) => {
  const { id, ...data } = payload;
  const response = await request({
    method: 'PATCH',
    url: `/org/proxy_configs/${id}`,
    headers: authHeaders,
    data,
  });

  return response.data;
};

const useUpdateProxyConfig = () => {
  const { t } = useTranslation('proxy-configs', {
    keyPrefix: 'notifications.update',
  });
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProxyConfigRequest) => updateProxyConfig(session.authHeaders, payload),

    onError: (error: unknown) => {
      toast.show({
        description: getErrorMessage(error),
        title: t('error.title'),
        variant: 'error',
      });
    },
    onSuccess: () => {
      toast.show({
        description: t('success.description'),
        title: t('success.title'),
      });
      queryClient.invalidateQueries();
    },
  });
};

export default useUpdateProxyConfig;
