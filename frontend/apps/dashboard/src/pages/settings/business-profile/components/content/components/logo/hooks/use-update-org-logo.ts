import { getOrgQueryKey, putOrgLogoMutation } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { Organization } from '@onefootprint/request-types/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const useUpdateOrgLogo = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders, setOrg } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    ...putOrgLogoMutation({
      headers: {
        'X-Fp-Dashboard-Authorization': authHeaders['x-fp-dashboard-authorization'],
      },
    }),
    onError: showErrorToast,
    onSuccess: (response: Organization) => {
      queryClient.invalidateQueries({ queryKey: getOrgQueryKey() });
      queryClient.setQueryData(['org'], response);
      setOrg({
        name: response.name,
        logoUrl: response.logoUrl,
        isSandboxRestricted: response.isSandboxRestricted,
      });
    },
  });
};

export default useUpdateOrgLogo;
