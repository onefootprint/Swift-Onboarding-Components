import request, { PaginatedRequestResponse } from '@onefootprint/request';
import { GetEntitiesResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getManualReview = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetEntitiesResponse>
  >({
    method: 'GET',
    url: '/entities',
    headers: authHeaders,
    params: { requiresManualReview: true },
  });

  return response;
};

const USE_MANUAL_REVIEW_FETCH_INTERVAL = 30000;

const useManualReview = () => {
  const { authHeaders, isLive } = useSession();

  return useQuery(
    ['entities', 'user', 'manual-review', authHeaders, isLive],
    () => getManualReview(authHeaders),
    { refetchInterval: USE_MANUAL_REVIEW_FETCH_INTERVAL },
  );
};

export default useManualReview;
