import { useRequestErrorToast } from '@onefootprint/hooks';
import type { OrgOnboardingConfigCreateRequest } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useSession from 'src/hooks/use-session';
import createPlaybook from 'src/queries/create-playbook';

import { useDialogButtons } from './use-dialog-buttons';

const useCreatePlaybook = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create' });
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const errorToast = useRequestErrorToast();
  const buttons = useDialogButtons();

  return useMutation({
    mutationFn: (data: OrgOnboardingConfigCreateRequest) => {
      buttons.setBusy(true);
      return createPlaybook(authHeaders, data);
    },
    onSuccess: () => {
      toast.show({
        title: t('feedback.success.title'),
        description: t('feedback.success.description'),
      });
    },
    onError: errorToast,
    onSettled: () => {
      buttons.setBusy(false);
      queryClient.invalidateQueries();
    },
  });
};

export default useCreatePlaybook;
