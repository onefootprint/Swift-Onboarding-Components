import type { GetEntityResponse } from '@onefootprint/types';
import { BusinessDI, type EntityStatus } from '@onefootprint/types/src/data';
import { useQueries } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import { getEntity } from './use-entity';
import useGetEntityOwnedBusinessIds from './use-get-entity-owned-business-ids';

export type EntityOwnedBusinessInfo = {
  id: string;
  status: EntityStatus;
  name: string;
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
        queryKey: ['entity', bid, authHeaders],
        queryFn: () => getEntity(authHeaders, { id: bid }),
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
