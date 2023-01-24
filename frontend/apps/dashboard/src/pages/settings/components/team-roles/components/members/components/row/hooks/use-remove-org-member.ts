import { useTranslation } from '@onefootprint/hooks';
import request, { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useOrgMembersFilters from '../../../hooks/use-org-members-filters';

const removeOrgMemberRequest = async (authHeaders: AuthHeaders, id: string) => {
  const { data } = await request({
    method: 'POST',
    url: `/org/members/${id}/deactivate`,
    headers: authHeaders,
  });

  return data;
};

const useRemoveOrgMember = (email: string) => {
  const { t } = useTranslation('pages.settings.members.table.actions.remove');
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();
  const { requestParams } = useOrgMembersFilters();

  return useMutation({
    mutationFn: (id: string) => removeOrgMemberRequest(session.authHeaders, id),
    onError: (error: unknown) => {
      toast.show({
        title: t('notification.error.title'),
        description: getErrorMessage(error),

        variant: 'error',
      });
    },
    onSuccess: () => {
      toast.show({
        title: t('notification.success.title'),
        description: t('notification.success.description', { email }),
      });
      queryClient.invalidateQueries(['org', 'members', requestParams]);
    },
  });
};

export default useRemoveOrgMember;
