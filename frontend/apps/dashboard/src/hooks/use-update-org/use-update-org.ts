import { getOrgQueryKey, patchOrgMutation } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { Organization, UpdateTenantRequest } from '@onefootprint/request-types/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const useUpdateOrg = () => {
  const showErrorToast = useRequestErrorToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTenantRequest) =>
      patchOrgMutation({
        headers: {
          'X-Fp-Dashboard-Authorization': session.authHeaders['x-fp-dashboard-authorization'],
        },
      }).mutationFn!({ body: payload }),
    onError: showErrorToast,
    onSuccess: (response: Organization) => {
      queryClient.invalidateQueries({ queryKey: ['org'] });
      queryClient.invalidateQueries({ queryKey: getOrgQueryKey() });
      queryClient.setQueryData(['org'], response);
      queryClient.setQueryData(getOrgQueryKey(), response);
      session.setOrg({
        name: response.name,
        logoUrl: response.logoUrl,
        isSandboxRestricted: response.isSandboxRestricted,
      });
    },
  });
};

export default useUpdateOrg;
