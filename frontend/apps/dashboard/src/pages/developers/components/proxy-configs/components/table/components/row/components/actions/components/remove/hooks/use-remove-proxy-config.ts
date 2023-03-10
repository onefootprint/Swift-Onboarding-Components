import { useTranslation } from '@onefootprint/hooks';
import request, { getErrorMessage } from '@onefootprint/request';
import { ProxyConfig } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const removeProxyConfig = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request({
    method: 'POST',
    url: `/org/proxy_configs/${id}/deactivate`,
    headers: authHeaders,
  });

  return response.data;
};

const useRemoveProxyConfig = (proxyConfig: ProxyConfig) => {
  const { t } = useTranslation('pages.proxy-configs.actions.remove');
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeProxyConfig(session.authHeaders, proxyConfig.id),
    onError: (error: unknown) => {
      toast.show({
        description: getErrorMessage(error),
        title: t('feedback.error.title'),
        variant: 'error',
      });
    },
    onSuccess: () => {
      toast.show({
        description: t('feedback.success.description', {
          name: proxyConfig.name,
        }),
        title: t('feedback.success.title'),
      });
      queryClient.invalidateQueries();
    },
  });
};

export default useRemoveProxyConfig;
