import request, { RequestError } from '@onefootprint/request';
import {
  GetUserRequest,
  GetUserResponse,
  OnboardingStatus,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';
import useUserStore from 'src/hooks/use-user-store';

import { UserMetadata } from '../../types';

const getMetadataRequest = async ({ authHeaders, userId }: GetUserRequest) => {
  const response = await request<GetUserResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}`,
    params: {
      isPinned: true,
    },
  });

  const { data } = response;
  return {
    ...data,
    requiresManualReview: data.onboarding?.requiresManualReview || false,
    status: data.onboarding?.status || OnboardingStatus.vaultOnly,
  };
};

const useGetMetadata = (userId: string) => {
  const userStore = useUserStore();
  const { authHeaders } = useSession();

  return useQuery<UserMetadata, RequestError>(
    ['get-metadata', authHeaders, userId],
    () => getMetadataRequest({ authHeaders, userId }),
    {
      enabled: !!userId,
      onSuccess(metadata) {
        userStore.merge({ userId, data: { metadata } });
      },
    },
  );
};

export default useGetMetadata;
