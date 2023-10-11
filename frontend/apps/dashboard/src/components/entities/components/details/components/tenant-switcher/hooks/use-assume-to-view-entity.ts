import request from '@onefootprint/request';
import type {
  GetPrivateEntityRequest,
  GetPrivateEntityResponse,
} from '@onefootprint/types/src/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import useOrgSession from 'src/hooks/use-org-session';
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
  const {
    authHeaders,
    refreshUserPermissions,
    data: { org },
    setIsLive,
  } = useSession();
  const { sandbox } = useOrgSession();
  const useAssumeTenantMutation = useAssumeTenant();
  const queryClient = useQueryClient();

  const switchTenant = (response: GetPrivateEntityResponse) => {
    const isSameTenant = response.tenantId === org?.id;
    const isDifferentMode = response.isLive !== org?.isLive;

    if (isSameTenant) {
      if (isDifferentMode) {
        sandbox.toggle();
        setIsLive(response.isLive);
        queryClient.invalidateQueries();
      }
      return;
    }
    useAssumeTenantMutation.mutate(
      { tenantId: response.tenantId },
      {
        onSuccess: async () => {
          await refreshUserPermissions({ isLive: response.isLive });
          queryClient.invalidateQueries();
        },
      },
    );
  };

  return useQuery(
    ['assume', 'entity', options.entityId],
    () => getPrivateEntity(authHeaders, { id: entityId }),
    {
      onSuccess: switchTenant,
      enabled: !!entityId && !!isFirmEmployee,
    },
  );
};

export default useAssumeToViewEntity;
