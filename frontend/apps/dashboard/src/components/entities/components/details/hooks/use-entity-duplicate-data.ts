import request from '@onefootprint/request';
import type {
  DuplicateDataItem,
  GetDuplicateDataRequest,
  GetDuplicateDataResponse,
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
  let sameTenantData: {
    sameTenant: DuplicateDataItem | undefined;
  }[] = [];
  if (duplicateData) {
    sameTenantData = duplicateData.sameTenant.map(sameTenant => ({
      sameTenant,
    }));
    sameTenantData.sort((a, b) => {
      if (!a.sameTenant?.startTimestamp || !b.sameTenant?.startTimestamp)
        return 0;
      return (
        new Date(b.sameTenant?.startTimestamp).getTime() -
        new Date(a.sameTenant?.startTimestamp).getTime()
      );
    });
    if (sameTenantData.length === 0) {
      sameTenantData.push({
        sameTenant: undefined,
      });
    }
  }

  const otherTenantsSummaryData = duplicateData?.otherTenant
    ? [
        {
          otherTenant: {
            data: { ...duplicateData.otherTenant },
            isSameTenantEmpty:
              !duplicateData.sameTenant ||
              duplicateData.sameTenant.length === 0,
          },
        },
      ]
    : [];

  const transformedData = [...sameTenantData, ...otherTenantsSummaryData];
  return transformedData;
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
