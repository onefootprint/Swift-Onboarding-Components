import request from '@onefootprint/request';
import {
  getOnboardingCanAccessAttributes,
  GetUserResponse,
  statusForScopedUser,
} from '@onefootprint/types';
import { Onboarding } from '@onefootprint/types/src/data/onboarding';
import { requiresManualReview } from '@onefootprint/types/src/data/scoped-user';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getUserRequest = async (authHeaders: AuthHeaders, userId: string) => {
  const response = await request<GetUserResponse>({
    method: 'GET',
    // TODO migrate to `GET /entities/<fp_id>` after we stop reading deprecated fields
    url: `/users/${userId}`,
    headers: authHeaders,
  });
  return response.data;
};

const useUser = (userId: string) => {
  const isReady = useRouter();
  const { authHeaders } = useSession();

  return useQuery(['user', userId], () => getUserRequest(authHeaders, userId), {
    enabled: isReady && !!userId,
    select: (response: GetUserResponse) => {
      const getOnboarding = (onboarding?: Onboarding) => {
        if (!onboarding) {
          return undefined;
        }
        return {
          ...onboarding,
          canAccessAttributes: getOnboardingCanAccessAttributes(onboarding),
        };
      };
      return {
        ...response,
        requiresManualReview: requiresManualReview(response),
        status: statusForScopedUser(response),
        onboarding: getOnboarding(response.onboarding),
      };
    },
  });
};

export default useUser;
