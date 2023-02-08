import { useTranslation } from '@onefootprint/hooks';
import request, { getErrorMessage } from '@onefootprint/request';
import {
  CreateOrgMembersRequest,
  CreateOrgMembersResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const inviteMemberRequest = async (
  authHeaders: AuthHeaders,
  payload: CreateOrgMembersRequest,
) => {
  const response = await request<CreateOrgMembersResponse>({
    method: 'POST',
    url: '/org/members',
    data: payload,
    headers: authHeaders,
  });

  return response.data;
};

const useInviteMembers = () => {
  const isMutating = useIsMutating(['inviteMember']);
  const { t } = useTranslation('pages.onboarding.invite');
  const toast = useToast();
  const session = useSession();
  const { mutateAsync } = useMutation({
    mutationKey: ['inviteMember'],
    mutationFn: (payload: CreateOrgMembersRequest) =>
      inviteMemberRequest(session.authHeaders, payload),
  });

  const mutate = async (
    invitations: CreateOrgMembersRequest[],
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
