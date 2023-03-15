import { faker } from '@faker-js/faker';
import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import {
  BusinessesRequest,
  BusinessesResponse,
  getRequiresManualReviewForScopedBusiness,
  getStatusForScopedBusiness,
  ScopedBusiness,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useCursorPagination } from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useFilters from './use-filters';

// TODO: Use correct endpoint
// https://linear.app/footprint/issue/FP-3090/business-list-use-correct-endpoint
const getBusinesses = async (
  authHeaders: AuthHeaders,
  payload: BusinessesRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<BusinessesResponse>
  >({
    method: 'GET',
    url: '/users',
    headers: authHeaders,
    params: payload,
  });

  return response;
};

const useBusinesses = () => {
  const { authHeaders } = useSession();
  const filters = useFilters();
  const { requestParams } = filters;
  const businessesQuery = useQuery(
    ['businesses', requestParams],
    () => getBusinesses(authHeaders, requestParams),
    {
      enabled: filters.isReady,
      select: (response: PaginatedRequestResponse<BusinessesResponse>) => ({
        meta: response.meta,
        data: response.data.map((metadata: ScopedBusiness) => ({
          // // TODO: use correct endpoint
          // https://linear.app/footprint/issue/FP-3090/business-list-use-correct-endpoint
          ...metadata,
          name: faker.company.name(),
          requiresManualReview:
            getRequiresManualReviewForScopedBusiness(metadata),
          status: getStatusForScopedBusiness(metadata),
        })),
      }),
    },
  );
  const pagination = useCursorPagination({
    count: businessesQuery.data?.meta.count,
    next: businessesQuery.data?.meta.next,
    cursor: filters.values.cursor,
    onChange: newCursor => filters.push({ businesses_cursor: newCursor }),
  });

  const { error } = businessesQuery;
  return {
    ...businessesQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    pagination,
  };
};

export default useBusinesses;
