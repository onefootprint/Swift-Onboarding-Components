import request from '@onefootprint/request';
import {
  EntityStatus,
  type GetDuplicateDataRequest,
  type GetDuplicateDataResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getDuplicateData = async (
  payload: GetDuplicateDataRequest,
  authHeaders: AuthHeaders,
) => {
  const { id } = payload;
  const { data: response } = await request<GetDuplicateDataResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${id}/dupes`,
  });
  return response;
};

const transformToDuplicateTableData = (
  duplicateData: GetDuplicateDataResponse,
) => {
  if (!duplicateData) return undefined;
  const transformedSameTenantData = duplicateData.sameTenant.map(item => ({
    ...item,
    status: item.status
      ? (item.status as unknown as EntityStatus)
      : EntityStatus.none,
  }));
  transformedSameTenantData.sort((a, b) => {
    if (!a.startTimestamp || !b.startTimestamp) return 0;
    return (
      new Date(b.startTimestamp).getTime() -
      new Date(a.startTimestamp).getTime()
    );
  });

  return {
    sameTenant: transformedSameTenantData,
    otherTenant: duplicateData.otherTenant,
  };
};

const useEntityDuplicateData = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['entity', id, 'duplicate-data', authHeaders],
    () => getDuplicateData({ id }, authHeaders),
    { enabled: !!id, select: transformToDuplicateTableData },
  );
};

export default useEntityDuplicateData;
