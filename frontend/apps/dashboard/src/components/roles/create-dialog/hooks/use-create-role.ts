import request, { getErrorMessage } from '@onefootprint/request';
import type { CreateRoleRequest, CreateRoleResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const createRoleRequest = async (authHeaders: AuthHeaders, payload: CreateRoleRequest) => {
  const { data } = await request<CreateRoleResponse>({
    method: 'POST',
    url: '/org/roles',
    headers: authHeaders,
    data: payload,
  });

  return data;
};

const useCreateRole = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.roles.create.notifications',
  });
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoleRequest) => createRoleRequest(session.authHeaders, payload),
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
      queryClient.invalidateQueries({ queryKey: ['org', 'roles'] });
    },
  });
};

export default useCreateRole;
