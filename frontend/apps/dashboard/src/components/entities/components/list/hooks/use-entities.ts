import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import {
  augmentEntityWithOnboardingInfo,
  EntityKind,
  GetEntitiesRequest,
  GetEntitiesResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useCursorPagination } from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useFilters from '../../../hooks/use-filters';

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

const useEntities = (kind: EntityKind) => {
  const { authHeaders } = useSession();
  const filters = useFilters();
  const { requestParams } = filters;
  const query = useQuery(
    ['entities', kind, requestParams],
    () => getEntities(authHeaders, { ...requestParams, kind }),
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
  });

  const { error } = query;
  return {
    ...query,
    errorMessage: error ? getErrorMessage(error) : undefined,
    pagination,
  };
};

export default useEntities;
