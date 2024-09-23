import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { EntityKind, GetEntitiesRequest, GetEntitiesResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useFilters from 'src/components/entities/hooks/use-filters';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getManualReview = async (payload: GetEntitiesRequest, authHeaders: AuthHeaders) => {
  const { data: response } = await request<PaginatedRequestResponse<GetEntitiesResponse>>({
    data: payload,
    headers: authHeaders,
    method: 'POST',
    url: '/entities/search',
  });

  return response;
};

const USE_MANUAL_REVIEW_FETCH_INTERVAL = 30000;

const useManualReview = (entityKind: EntityKind) => {
  const { authHeaders, isLive } = useSession();
  const filters = useFilters();
  const { requestParams } = filters;

  return useQuery({
    queryKey: ['entities', entityKind, 'manual-review', requestParams, authHeaders, isLive],
    queryFn: () =>
      getManualReview(
        {
          kind: entityKind,
          requiresManualReview: true,
        },
        authHeaders,
      ),
    refetchInterval: USE_MANUAL_REVIEW_FETCH_INTERVAL,
  });
};

export default useManualReview;
