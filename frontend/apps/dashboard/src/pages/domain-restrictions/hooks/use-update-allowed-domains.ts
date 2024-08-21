import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { UpdateClientSecurityConfigRequest, UpdateClientSecurityConfigResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateDomains = async (authHeaders: AuthHeaders, data: UpdateClientSecurityConfigRequest) => {
  const response = await request<UpdateClientSecurityConfigResponse>({
    method: 'PATCH',
    url: '/org/client_security_config',
    data,
    headers: authHeaders,
  });

  return response.data;
};

const useUpdateAllowedDomains = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const showError = useRequestErrorToast();

  return useMutation({
    mutationFn: (data: UpdateClientSecurityConfigRequest) => updateDomains(authHeaders, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allowed-domains']);
    },
    onError: err => showError(err),
  });
};

export default useUpdateAllowedDomains;
