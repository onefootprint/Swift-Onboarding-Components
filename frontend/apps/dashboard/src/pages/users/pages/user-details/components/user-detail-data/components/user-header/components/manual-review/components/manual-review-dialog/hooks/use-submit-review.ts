import request from '@onefootprint/request';
import { SubmitReviewRequest, SubmitReviewResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const submitReview = async (
  authHeaders: AuthHeaders,
  data: SubmitReviewRequest,
) => {
  const { footprintUserId, annotation, status } = data;
  const response = await request<SubmitReviewResponse>({
    method: 'POST',
    url: `/entities/${footprintUserId}/decisions`,
    data: {
      annotation,
      status,
    },
    headers: authHeaders,
  });

  return response.data;
};

const useSubmitReview = () => {
  const { authHeaders } = useSession();

  return useMutation((data: SubmitReviewRequest) =>
    submitReview(authHeaders, data),
  );
};

export default useSubmitReview;
