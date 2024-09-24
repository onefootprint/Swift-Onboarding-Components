import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { UpdateOrgRequest, UpdateOrgResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateOrgRequest = async (authHeaders: AuthHeaders, payload: UpdateOrgRequest) => {
  const { data } = await request<UpdateOrgResponse>({
    method: 'PATCH',
    url: '/org',
    headers: authHeaders,
    data: payload,
  });

  return data;
};

const useUpdateOrg = () => {
  const showErrorToast = useRequestErrorToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrgRequest) => updateOrgRequest(session.authHeaders, payload),
    onError: showErrorToast,
    onSuccess: (response: UpdateOrgResponse) => {
      queryClient.invalidateQueries({ queryKey: ['org'] });
      queryClient.setQueryData(['org'], response);
      session.setOrg({
        name: response.name,
        logoUrl: response.logoUrl,
        isSandboxRestricted: response.isSandboxRestricted,
      });
    },
  });
};

export default useUpdateOrg;
