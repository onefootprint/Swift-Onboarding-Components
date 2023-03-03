import request from '@onefootprint/request';
import { ScopedUser, statusForScopedUser } from '@onefootprint/types';
import { requiresManualReview } from '@onefootprint/types/src/data/scoped-user';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

type UserResponse = ScopedUser;

const getUserRequest = async (authHeaders: AuthHeaders, userId: string) => {
  const { data } = await request<UserResponse>({
    method: 'GET',
    url: `/users/${userId}`,
    headers: authHeaders,
  });
  return {
    ...data,
    requiresManualReview: requiresManualReview(data),
    status: statusForScopedUser(data),
  };
};

const useUser = (userId: string) => {
  const isReady = useRouter();
  const { authHeaders } = useSession();

  return useQuery(['user', userId], () => getUserRequest(authHeaders, userId), {
    enabled: isReady && !!userId,
  });
};

export default useUser;
