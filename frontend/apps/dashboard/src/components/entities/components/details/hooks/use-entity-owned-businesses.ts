import request from '@onefootprint/request';
import type { GetEntityRequest, GetEntityResponse } from '@onefootprint/types';
import { BusinessDI, type EntityStatus } from '@onefootprint/types/src/data';
import { useQueries } from '@tanstack/react-query';
import useSession, { type AuthHeaders } from 'src/hooks/use-session';
import useGetEntityOwnedBusinessIds from './use-get-entity-owned-business-ids';

export type EntityOwnedBusinessInfo = {
  id: string;
  status: EntityStatus;
  name: string;
  startTimestamp: string;
};

export enum EntityOwnedBusinessRequestStatus {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

// TODO: replace with the one from @onefootprint/axios/dashboard
const getEntity = async (authHeaders: AuthHeaders, { id }: GetEntityRequest) => {
  const response = await request<GetEntityResponse>({
    method: 'GET',
    url: `/entities/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useEntityOwnedBusinesses = (id: string) => {
  const businessIdsMutation = useGetEntityOwnedBusinessIds(id);
  const businessIds = businessIdsMutation.data;
  const { authHeaders } = useSession();

  const businessQueries = useQueries({
    queries:
      businessIds?.map(({ id: bid }) => ({
        queryKey: ['entity', bid, authHeaders],
        queryFn: () => getEntity(authHeaders, { id: bid }),
        select: (response: GetEntityResponse): EntityOwnedBusinessInfo => {
          return {
            id: response.id,
            status: response.status,
            name: (response.data.find(attribute => attribute.identifier === BusinessDI.name)?.value as string) || '-',
            startTimestamp: response.startTimestamp,
          };
        },
      })) || [],
  });

  const isPending = businessIdsMutation.isPending || businessQueries.some(query => query.isPending);
  const isError = businessIdsMutation.isError || businessQueries.some(query => query.isError);
  const isSuccess = businessIdsMutation.isSuccess && businessQueries.every(query => query.isSuccess);

  const businesses = isSuccess ? businessQueries.map(query => query.data as EntityOwnedBusinessInfo) : undefined;

  const hasBusinesses = isSuccess && !!businesses?.length && businesses.length > 0;

  return {
    hasBusinesses,
    ownedBusinesses: businesses,
    isPending,
    isError,
    isSuccess,
  };
};

export default useEntityOwnedBusinesses;
