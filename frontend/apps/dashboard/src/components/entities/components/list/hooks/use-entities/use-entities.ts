import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type {
  EntityKind,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from '@onefootprint/types';
import { augmentEntityWithOnboardingInfo } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useCursorPagination } from 'src/hooks/use-pagination';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useFilters from '../../../../hooks/use-filters';

const getEntities = async (
  authHeaders: AuthHeaders,
  params: GetEntitiesRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetEntitiesResponse>
  >({
    method: 'GET',
    url: '/entities',
    headers: authHeaders,
    params,
  });

  return response;
};

const useEntities = (
  kind: EntityKind,
  defaultFilters?: Record<string, any>,
) => {
  const { authHeaders, isLive } = useSession();
  const filters = useFilters();
  const { requestParams } = filters;

  const query = useQuery(
    ['entities', kind, requestParams, authHeaders, defaultFilters, isLive],
    () =>
      getEntities(authHeaders, {
        ...requestParams,
        ...defaultFilters,
        kind,
      }),
    {
      enabled: filters.isReady,
      select: (response: PaginatedRequestResponse<GetEntitiesResponse>) => ({
        meta: response.meta,
        data: response.data.map(augmentEntityWithOnboardingInfo),
      }),
    },
  );
  const pagination = useCursorPagination({
    count: query.data?.meta.count,
    next: query.data?.meta.next,
    cursor: filters.values.cursor,
    onChange: newCursor => filters.push({ cursor: newCursor }),
    pageSize: 15,
  });

  const { error } = query;
  return {
    ...query,
    errorMessage: error ? getErrorMessage(error) : undefined,
    pagination,
  };
};

export default useEntities;
