import request, { getErrorMessage } from '@onefootprint/request';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useMembersFilters from '../../../../../hooks/use-members-filters';

const removeMemberRequest = async (authHeaders: AuthHeaders, id: string) => {
  const { data } = await request({
    method: 'POST',
    url: `/org/members/${id}/deactivate`,
    headers: authHeaders,
  });

  return data;
};

const useRemoveMember = (email: string) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.table.actions.remove',
  });
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();
  const { requestParams } = useMembersFilters();

  return useMutation({
    mutationFn: (id: string) => removeMemberRequest(session.authHeaders, id),
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

export default useRemoveMember;
