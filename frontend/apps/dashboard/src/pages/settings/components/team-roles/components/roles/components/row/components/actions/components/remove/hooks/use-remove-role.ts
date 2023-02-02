import { useTranslation } from '@onefootprint/hooks';
import request, { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const removeRoleRequest = async (authHeaders: AuthHeaders, id: string) => {
  const { data } = await request({
    method: 'POST',
    url: `/org/roles/${id}/deactivate`,
    headers: authHeaders,
  });

  return data;
};

const useRemoveRole = (name: string) => {
  const { t } = useTranslation('pages.settings.roles.remove');
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeRoleRequest(session.authHeaders, id),
    onError: (error: unknown) => {
      toast.show({
        description: getErrorMessage(error),
        title: t('feedback.error.title'),
        variant: 'error',
      });
    },
    onSuccess: () => {
      toast.show({
        description: t('feedback.success.description', { name }),
        title: t('feedback.success.title'),
      });
      queryClient.invalidateQueries();
    },
  });
};

export default useRemoveRole;
