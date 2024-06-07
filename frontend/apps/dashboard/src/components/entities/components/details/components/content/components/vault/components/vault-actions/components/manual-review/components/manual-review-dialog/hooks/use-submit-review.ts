import request from '@onefootprint/request';
import type { SubmitReviewRequest, SubmitReviewResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const submitReview = async (authHeaders: AuthHeaders, { entityId, ...data }: SubmitReviewRequest) => {
  const response = await request<SubmitReviewResponse>({
    method: 'POST',
    url: `/entities/${entityId}/decisions`,
    data,
    headers: authHeaders,
  });

  return response.data;
};

const useSubmitReview = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitReviewRequest) => submitReview(authHeaders, data),
    onSuccess: () => {
      queryClient.refetchQueries();
    },
  });
};

export default useSubmitReview;
