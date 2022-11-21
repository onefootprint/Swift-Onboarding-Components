import request, { RequestError } from '@onefootprint/request';
import {
  GetPinnedAnnotationsRequest,
  GetPinnedAnnotationsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser from 'src/hooks/use-session-user';

import useUserId from '../../../../../hooks/use-user-id/use-user-id';

const getPinnedAnnotations = async ({
  authHeaders,
  userId,
}: GetPinnedAnnotationsRequest) => {
  const response = await request<GetPinnedAnnotationsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/annotations`,
    params: {
      isPinned: true,
    },
  });
  return response.data;
};

const useGetPinnedAnnotations = (
  options: {
    onSuccess?: (data: GetPinnedAnnotationsResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const { authHeaders } = useSessionUser();
  const userId = useUserId();

  return useQuery<GetPinnedAnnotationsResponse, RequestError>(
    ['get-pinned-annotations', authHeaders, userId],
    () => getPinnedAnnotations({ authHeaders, userId }),
    {
      enabled: !!userId,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetPinnedAnnotations;
