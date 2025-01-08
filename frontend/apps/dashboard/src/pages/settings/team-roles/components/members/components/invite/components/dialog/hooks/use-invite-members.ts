import { getOrgMembersQueryKey, postOrgMembers } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import type { CreateTenantUserRequest } from '@onefootprint/request-types/dashboard';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';

const useInviteMembers = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.members.invite' });
  const toast = useToast();
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: CreateTenantUserRequest[]) => {
      const responses = await Promise.all(
        payload.map(invitation =>
          postOrgMembers({
            headers: {
              'X-Fp-Dashboard-Authorization': authHeaders['x-fp-dashboard-authorization'],
            },
            body: invitation,
            throwOnError: true,
          }),
        ),
      );
      // Return data from the first response only to satisfy the mutationFn type requirement
      return responses[0].data;
    },
  });

  const mutate = async (
    invitations: CreateTenantUserRequest[],
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
        queryClient.invalidateQueries({ queryKey: getOrgMembersQueryKey() });
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
