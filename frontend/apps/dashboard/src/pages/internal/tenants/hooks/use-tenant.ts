import request from '@onefootprint/request';
import type { TenantDetail } from '@onefootprint/types/src/api/get-tenants';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getTenant = async (authHeaders: AuthHeaders, id?: string) => {
  const response = await request<TenantDetail>({
    method: 'GET',
    url: `/private/tenants/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useTenant = ({ id }: { id?: string }) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['super-admin', 'tenants', id, authHeaders],
    () => getTenant(authHeaders, id),
    {
      enabled: !!id,
    },
  );
};

export default useTenant;
