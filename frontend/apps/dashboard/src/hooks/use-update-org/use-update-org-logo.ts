import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { UpdateOrgResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateOrgLogoRequest = async (authHeaders: AuthHeaders, formData: FormData) => {
  const { data } = await request<UpdateOrgResponse>({
    method: 'PUT',
    url: '/org/logo',
    headers: {
      'content-type': 'multipart/form-data',
      ...authHeaders,
    },
    data: formData,
  });

  return data;
};

const useUpdateOrgLogo = () => {
  const showErrorToast = useRequestErrorToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => updateOrgLogoRequest(session.authHeaders, payload),
    onError: (error: unknown) => {
      showErrorToast(error);
    },
    onSuccess: (response: UpdateOrgResponse) => {
      queryClient.invalidateQueries(['org']);
      queryClient.setQueryData(['org'], response);
      session.setOrg({
        name: response.name,
        logoUrl: response.logoUrl,
        isSandboxRestricted: response.isSandboxRestricted,
      });
    },
  });
};

export default useUpdateOrgLogo;
