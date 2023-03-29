import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import {
  Entity,
  EntityKind,
  GetEntitiesRequest,
  GetEntitiesResponse,
  getEntityManualReview,
  getEntityOnboardingCanAccessAttributes,
  getEntityStatus,
  Onboarding,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useCursorPagination } from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useFilters from './use-filters';

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
  const entitiesQuery = useQuery(
    ['entities', requestParams],
    () => getEntities(authHeaders, { ...requestParams, kind }),
    {
      enabled: filters.isReady,
      select: (response: PaginatedRequestResponse<GetEntitiesResponse>) => {
        const getOnboarding = (onboarding?: Onboarding) => {
          if (!onboarding) {
            return undefined;
          }
          return {
            ...onboarding,
            canAccessAttributes:
              getEntityOnboardingCanAccessAttributes(onboarding),
          };
        };

        return {
          meta: response.meta,
          data: response.data.map((entity: Entity) => ({
            ...entity,
            requiresManualReview: getEntityManualReview(entity),
            status: getEntityStatus(entity),
            onboarding: getOnboarding(entity.onboarding),
          })),
        };
      },
    },
  );
  const pagination = useCursorPagination({
    count: entitiesQuery.data?.meta.count,
    next: entitiesQuery.data?.meta.next,
    cursor: filters.values.cursor,
    onChange: newCursor => filters.push({ cursor: newCursor }),
  });

  const { error } = entitiesQuery;
  return {
    ...entitiesQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    pagination,
  };
};

export default useEntities;
