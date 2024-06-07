import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { UserUpdateRequest, UserUpdateResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import type { AuthHeaders } from '../use-session';
import useSession from '../use-session';

const updateUser = async (authHeaders: AuthHeaders, data: UserUpdateRequest) => {
  const response = await request<UserUpdateResponse>({
    data,
    headers: authHeaders,
    method: 'PATCH',
    url: '/org/member',
  });

  return response.data;
};

const useUserSession = () => {
  const showErrorToast = useRequestErrorToast();
  const session = useSession();
  const data = session.data?.user;
  const dangerouslyCastedData = session.dangerouslyCastedData.user;

  const mutation = useMutation({
    mutationFn: (payload: UserUpdateRequest) => updateUser(session.authHeaders, payload),
    onSuccess: session.updateUserName,
    onError: showErrorToast,
  });

  return {
    dangerouslyCastedData,
    data,
    mutation,
  };
};

export default useUserSession;
