import { useIntl } from '@onefootprint/hooks';
import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type { GetTenantsRequest, GetTenantsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useFilters from './use-filters';

const getTenants = async (authHeaders: AuthHeaders, params: GetTenantsRequest) => {
  const response = await request<PaginatedRequestResponse<GetTenantsResponse>>({
    method: 'GET',
    url: '/private/tenants',
    headers: authHeaders,
    params,
  });

  return response.data;
};

const useTenants = () => {
  const { formatDateWithTime } = useIntl();
  const { authHeaders } = useSession();
  const filters = useFilters();

  const query = useQuery({
    queryKey: ['super-admin', 'tenants', filters.requestParams, authHeaders],
    queryFn: () => getTenants(authHeaders, filters.requestParams),
    select: tenants => ({
      ...tenants,
      data: tenants.data.map(tenant => {
        const createdAt = new Date(tenant.createdAt);
        return {
          ...tenant,
          createdAt: formatDateWithTime(createdAt),
        };
      }),
    }),
  });

  const pagination = usePagination({
    count: query.data?.meta.count,
    next: query.data?.meta.nextPage,
    page: filters.values.page,
    onChange: newPage => filters.push({ tenants_page: newPage }),
    pageSize: 15,
  });

  return {
    ...query,
    errorMessage: query.error ? getErrorMessage(query.error) : undefined,
    pagination,
  };
};

export default useTenants;
