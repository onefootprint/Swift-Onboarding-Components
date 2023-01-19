import request from '@onefootprint/request';
import {
  Organization,
  UpdateOrgRequest,
  UpdateOrgResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const updateOrgRequest = async (
  authHeaders: AuthHeaders,
  payload: UpdateOrgRequest,
) => {
  const { data } = await request<UpdateOrgResponse>({
    method: 'PATCH',
    url: '/org',
    headers: authHeaders,
    data: payload,
  });

  return data;
};

const useUpdateOrg = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrgRequest) =>
      updateOrgRequest(authHeaders, payload),
    onSuccess: (response: UpdateOrgResponse, payload: UpdateOrgRequest) => {
      queryClient.invalidateQueries(['org']);
      const prevOrg = queryClient.getQueryData<Organization>(['org']);
      if (prevOrg) {
        queryClient.setQueryData(['org'], {
          ...prevOrg,
          ...payload,
        });
      }
    },
  });
};

export default useUpdateOrg;
