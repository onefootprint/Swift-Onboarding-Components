import request, { RequestError } from '@onefootprint/request';
import { SubmitReviewRequest, SubmitReviewResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

const submitReview = async (
  authHeaders: AuthHeaders,
  data: SubmitReviewRequest,
) => {
  const { footprintUserId, annotation, status } = data;
  const response = await request<SubmitReviewResponse>({
    method: 'POST',
    url: `/users/${footprintUserId}/decisions`,
    data: {
      annotation,
      status,
    },
    headers: authHeaders,
  });

  return response.data;
};

const useSubmitReview = () => {
  const { authHeaders } = useSessionUser();

  return useMutation<SubmitReviewResponse, RequestError, SubmitReviewRequest>(
    (data: SubmitReviewRequest) => submitReview(authHeaders, data),
  );
};

export default useSubmitReview;
