import request, { getErrorMessage } from '@onefootprint/request';
import type { UpdateMemberRequest, UpdateMemberResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const updateMemberRequest = async (authHeaders: AuthHeaders, id: string, payload: UpdateMemberRequest) => {
  const { data } = await request<UpdateMemberResponse>({
    method: 'patch',
    url: `/org/members/${id}`,
    headers: authHeaders,
    data: payload,
  });

  return data;
};

const useUpdateMember = (memberId: string) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.members.edit-role.notifications',
  });
  const session = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: UpdateMemberRequest) => updateMemberRequest(session.authHeaders, memberId, payload),
    onError: (error: unknown) => {
      toast.show({
        title: t('error.title'),
        description: getErrorMessage(error),
        variant: 'error',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useUpdateMember;
