import request from '@onefootprint/request';
import type { TenantDetail } from '@onefootprint/types/src/api/get-tenants';
import { useQuery } from '@tanstack/react-query';
import { snakeCase } from 'lodash';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getTenant = async (authHeaders: AuthHeaders, id?: string) => {
  const response = await request<TenantDetail>({
    method: 'GET',
    url: `/private/tenants/${id}`,
    headers: authHeaders,
  });

  const { billingProfile, ...restOfData } = response.data;
  if (billingProfile) {
    billingProfile.prices = Object.fromEntries(
      Object.entries(billingProfile.prices).map(([k, v]) => [snakeCase(k), v]),
    );
  }

  return { ...restOfData, billingProfile };
};

const useTenant = ({ id }: { id?: string }) => {
  const { authHeaders } = useSession();

  return useQuery({
    queryKey: ['super-admin', 'tenants', id, authHeaders],
    queryFn: () => getTenant(authHeaders, id),
    enabled: !!id,
  });
};

export default useTenant;
