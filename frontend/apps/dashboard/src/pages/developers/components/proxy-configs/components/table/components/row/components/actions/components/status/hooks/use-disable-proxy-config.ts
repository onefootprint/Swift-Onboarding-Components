import { useTranslation } from '@onefootprint/hooks';
import request, { getErrorMessage } from '@onefootprint/request';
import { ProxyConfig, UpdateProxyConfigRequest } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const disableProxyConfig = async (
  authHeaders: AuthHeaders,
  id: string,
  data: UpdateProxyConfigRequest,
) => {
  const response = await request({
    method: 'PATCH',
    url: `/org/proxy_configs/${id}`,
    headers: authHeaders,
    data,
  });

  return response.data;
};

const useDisableProxyConfig = (proxyConfig: ProxyConfig) => {
  const { t } = useTranslation('pages.proxy-configs.actions.status');
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProxyConfigRequest) =>
      disableProxyConfig(session.authHeaders, proxyConfig.id, payload),
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

export default useDisableProxyConfig;
