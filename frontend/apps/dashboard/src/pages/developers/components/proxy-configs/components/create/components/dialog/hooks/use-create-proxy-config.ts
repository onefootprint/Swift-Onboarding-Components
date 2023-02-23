import { useTranslation } from '@onefootprint/hooks';
import request, { getErrorMessage } from '@onefootprint/request';
import {
  CreateProxyConfigRequest,
  CreateProxyConfigResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { PROXY_CONFIGS_LIST_QUERY_KEY } from '@/proxy-configs/constants';

const createProxyConfig = async (
  authHeaders: AuthHeaders,
  payload: CreateProxyConfigRequest,
) => {
  const response = await request<CreateProxyConfigResponse>({
    method: 'POST',
    url: '/org/proxy_configs',
    headers: authHeaders,
    data: payload,
  });

  return response.data;
};

const useCreateProxyConfig = () => {
  const { t } = useTranslation('pages.proxy-configs.notifications');
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProxyConfigRequest) =>
      createProxyConfig(session.authHeaders, payload),
    onError: (error: unknown) => {
      toast.show({
        title: t('error.title'),
        description: getErrorMessage(error),
        variant: 'error',
      });
    },
    onSuccess: () => {
      toast.show({
        title: t('success.title'),
        description: t('success.description'),
      });
      queryClient.invalidateQueries(PROXY_CONFIGS_LIST_QUERY_KEY);
    },
  });
};

export default useCreateProxyConfig;
