import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type {
  UserUpdateRequest,
  UserUpdateResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import useSession from '../use-session';

const updateUser = async (data: UserUpdateRequest) => {
  // TODO: Dashboard onboarding: step 2: integrate with real backend
  // https://linear.app/footprint/issue/FP-2202/dashboard-onboarding-step-2-integrate-with-real-backend
  const response = await request<UserUpdateResponse>({
    baseURL: 'https://6398b28afe03352a94dba0aa.mockapi.io',
    data,
    method: 'PUT',
    url: '/api/users/1',
    withCredentials: false,
  });
  return response.data;
};

const useUserSession = () => {
  const showErrorToast = useRequestErrorToast();
  const session = useSession();
  const data = session.data?.user;
  const dangerouslyCastedData = session.dangerouslyCastedData.user;

  const mutation = useMutation(updateUser, {
    onSuccess: session.setUser,
    onError: showErrorToast,
  });

  return {
    dangerouslyCastedData,
    data,
    mutation,
  };
};

export default useUserSession;
