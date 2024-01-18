import request from '@onefootprint/request';
import type {
  GetPrivateEntityRequest,
  GetPrivateEntityResponse,
} from '@onefootprint/types/src/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getPrivateEntity = async (
  authHeaders: AuthHeaders,
  { id }: GetPrivateEntityRequest,
) => {
  const response = await request<GetPrivateEntityResponse>({
    method: 'GET',
    url: `private/entities/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useAssumeToViewEntity = (options: {
  entityId: string;
  isFirmEmployee: boolean;
}) => {
  const { entityId, isFirmEmployee } = options;
  const router = useRouter();
  const {
    authHeaders,
    refreshUserPermissions,
    data: { org },
    setIsLive,
  } = useSession();
  const useAssumeTenantMutation = useAssumeTenant();
  const queryClient = useQueryClient();

  const switchTenant =
    (id: string) => async (response: GetPrivateEntityResponse) => {
      const isSameTenant = response.tenantId === org?.id;
      const isDifferentMode = response.isLive !== org?.isLive;

      const changeRouteIfNeeded = () => {
        // If a scoped user ID was provided instead of an fp_id, replace the id with the fpid
        const isDifferentFpId = response.id !== id;
        if (isDifferentFpId) {
          const newRoute = router.pathname.replace(/[^/]*$/, response.id);
          router.replace(newRoute);
        }
      };

      if (isSameTenant) {
        if (isDifferentMode) {
          await setIsLive(response.isLive);
          queryClient.invalidateQueries();
        }
        changeRouteIfNeeded();
        return;
      }
      useAssumeTenantMutation.mutate(
        { tenantId: response.tenantId },
        {
          onSuccess: async () => {
            await refreshUserPermissions({ newIsLive: response.isLive });
            queryClient.invalidateQueries();
            changeRouteIfNeeded();
          },
        },
      );
    };

  return useQuery(
    ['assume', 'entity', options.entityId],
    () => getPrivateEntity(authHeaders, { id: entityId }),
    {
      onSuccess: switchTenant(entityId),
      enabled: !!entityId && !!isFirmEmployee,
    },
  );
};

export default useAssumeToViewEntity;
