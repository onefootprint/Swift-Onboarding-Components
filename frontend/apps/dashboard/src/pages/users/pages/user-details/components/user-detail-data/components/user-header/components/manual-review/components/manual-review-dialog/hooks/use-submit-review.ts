import request, { RequestError } from '@onefootprint/request';
import { SubmitReviewRequest, SubmitReviewResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

const submitReview = async (
  authHeaders: AuthHeaders,
  data: SubmitReviewRequest,
) => {
  // TODO: Integrate with API when implemented
  // https://linear.app/footprint/issue/FP-1860/integrate-with-submit-review-api-see-use-submit-reviewts-hook
  const response = await request<SubmitReviewResponse>({
    method: 'POST',
    url: '', // TODO:
    data,
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
