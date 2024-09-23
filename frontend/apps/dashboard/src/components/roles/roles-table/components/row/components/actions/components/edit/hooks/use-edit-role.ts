import request, { getErrorMessage } from '@onefootprint/request';
import type { UpdateRoleRequest, UpdateRoleResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateRoleRequest = async (authHeaders: AuthHeaders, id: string, payload: UpdateRoleRequest) => {
  const { data } = await request<UpdateRoleResponse>({
    method: 'patch',
    url: `/org/roles/${id}`,
    headers: authHeaders,
    data: payload,
  });

  return data;
};

const useEditRole = (id: string) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.roles.edit.notifications',
  });
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRoleRequest) => updateRoleRequest(session.authHeaders, id, payload),
    onError: (error: unknown) => {
      toast.show({
        title: t('error.title'),
        description: getErrorMessage(error),
        variant: 'error',
      });
    },
    onSuccess: response => {
      toast.show({
        title: t('success.title'),
        description: t('success.description', { name: response.name }),
      });
      queryClient.invalidateQueries(['org', 'roles']);
    },
  });
};

export default useEditRole;
