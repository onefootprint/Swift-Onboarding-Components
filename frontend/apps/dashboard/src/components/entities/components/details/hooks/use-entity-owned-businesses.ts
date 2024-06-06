import request from '@onefootprint/request/src/request';
import type { GetEntityRequest, GetEntityResponse } from '@onefootprint/types';
import { type ApiEntityStatus, BusinessDI } from '@onefootprint/types/src/data';
import { useQueries } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useGetEntityOwnedBusinessIds from './use-get-entity-owned-business-ids';

export type EntityOwnedBusinessInfo = {
  id: string;
  status: ApiEntityStatus | undefined;
  name: string;
};

const getBusiness = async (
  authHeaders: AuthHeaders,
  { id }: GetEntityRequest,
) => {
  const response = await request<GetEntityResponse>({
    method: 'GET',
    url: `/entities/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

export enum EntityOwnedBusinessRequestStatus {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

const useEntityOwnedBusinesses = (id: string) => {
  const businessIdsMutation = useGetEntityOwnedBusinessIds(id);
  const businessIds = businessIdsMutation.data;
  const { authHeaders } = useSession();

  const businessQueries = useQueries({
    queries:
      businessIds?.map(({ id: bid }) => ({
        queryKey: ['entity', bid, 'owned_businesses'],
        queryFn: () => getBusiness(authHeaders, { id: bid }),
        select: (response: GetEntityResponse): EntityOwnedBusinessInfo => ({
          id: response.id,
          status: response.status,
          name:
            (response.data.find(
              attribute => attribute.identifier === BusinessDI.name,
            )?.value as string) || '-',
        }),
      })) || [],
  });

  const isLoading =
    businessIdsMutation.isLoading ||
    businessQueries.some(query => query.isLoading);
  const isError =
    businessIdsMutation.error || businessQueries.some(query => query.isError);
  const isSuccess =
    businessIdsMutation.isSuccess &&
    businessQueries.every(query => query.data !== undefined);

  const businesses = isSuccess
    ? businessQueries.map(query => query.data as EntityOwnedBusinessInfo)
    : undefined;

  const hasBusinesses =
    isSuccess && !!businesses?.length && businesses.length > 0;

  return {
    hasBusinesses,
    ownedBusinesses: businesses,
    isLoading,
    isError,
    isSuccess,
  };
};

export default useEntityOwnedBusinesses;
