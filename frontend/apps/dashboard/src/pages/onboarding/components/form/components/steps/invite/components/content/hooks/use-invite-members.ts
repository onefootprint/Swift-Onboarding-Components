import request, { getErrorMessage } from '@onefootprint/request';
import type { CreateMembersRequest, CreateMembersResponse } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const inviteMember = async (authHeaders: AuthHeaders, payload: CreateMembersRequest) => {
  const response = await request<CreateMembersResponse>({
    method: 'POST',
    url: '/org/members',
    data: payload,
    headers: authHeaders,
  });

  return response.data;
};

const useInviteMembers = () => {
  const isMutating = useIsMutating(['inviteMember']);
  const { t } = useTranslation('onboarding', {
    keyPrefix: 'invite',
  });
  const toast = useToast();
  const session = useSession();
  const { mutateAsync } = useMutation({
    mutationKey: ['inviteMember'],
    mutationFn: (payload: CreateMembersRequest) => inviteMember(session.authHeaders, payload),
  });

  const mutate = async (
    invitations: CreateMembersRequest[],
    options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    },
  ) => {
    const promises = invitations.map(invitation => mutateAsync(invitation));
    Promise.all(promises)
      .then(() => {
        options?.onSuccess?.();
      })
      .catch(error => {
        toast.show({
          description: getErrorMessage(error),
          title: t('notification.error.title', { count: invitations.length }),
          variant: 'error',
        });
        options?.onError?.(error);
      });
  };

  return { mutate, isLoading: !!isMutating };
};

export default useInviteMembers;
