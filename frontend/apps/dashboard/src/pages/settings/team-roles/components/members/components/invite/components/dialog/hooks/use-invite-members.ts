import request, { getErrorMessage } from '@onefootprint/request';
import type { CreateMembersRequest, CreateMembersResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const inviteMemberRequest = async (authHeaders: AuthHeaders, payload: CreateMembersRequest) => {
  const response = await request<CreateMembersResponse>({
    method: 'POST',
    url: '/org/members',
    data: payload,
    headers: authHeaders,
  });

  return response.data;
};

const useInviteMembers = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.members.invite',
  });
  const toast = useToast();
  const session = useSession();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateMembersRequest[]) =>
      Promise.all(payload.map(invitation => inviteMemberRequest(session.authHeaders, invitation))),
  });

  const mutate = async (
    invitations: CreateMembersRequest[],
    options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    mutation.mutate(invitations, {
      onSuccess: () => {
        toast.show({
          title: t('notification.success.title', { count: invitations.length }),
          description: t('notification.success.description', {
            count: invitations.length,
          }),
        });
        queryClient.invalidateQueries({ queryKey: ['org', 'members'] });
        options?.onSuccess?.();
      },
      onError: error => {
        toast.show({
          description: getErrorMessage(error),
          title: t('notification.error.title', { count: invitations.length }),
          variant: 'error',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    mutate,
    isPending: mutation.isPending,
  };
};

export default useInviteMembers;
