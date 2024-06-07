import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetEntitiesResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getManualReview = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<PaginatedRequestResponse<GetEntitiesResponse>>({
    method: 'POST',
    url: '/entities/search',
    headers: authHeaders,
    data: { requiresManualReview: true, kind: 'person' },
  });

  return response;
};

const USE_MANUAL_REVIEW_FETCH_INTERVAL = 30000;

const useManualReview = () => {
  const { authHeaders, isLive } = useSession();

  return useQuery(['entities', 'user', 'manual-review', authHeaders, isLive], () => getManualReview(authHeaders), {
    refetchInterval: USE_MANUAL_REVIEW_FETCH_INTERVAL,
  });
};

export default useManualReview;
