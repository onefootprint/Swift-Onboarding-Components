import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

type CleanupRequest = {
  email?: string;
  phoneNumber?: string;
};

type CleanUpResponse = {
  numDeletedRows: number;
};

const submitCleanUpRqequest = async (authHeaders: AuthHeaders, data: CleanupRequest) => {
  const response = await request<CleanUpResponse>({
    method: 'POST',
    url: '/private/cleanup',
    headers: authHeaders,
    data,
  });
  return response.data;
};

const useCleanUp = () => {
  const showErrorToast = useRequestErrorToast();
  const { authHeaders } = useSession();

  return useMutation({
    mutationFn: (data: CleanupRequest) => submitCleanUpRqequest(authHeaders, data),
    onError: showErrorToast,
  });
};

export default useCleanUp;
