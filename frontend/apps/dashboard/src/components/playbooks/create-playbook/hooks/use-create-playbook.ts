import { postOrgOnboardingConfigs } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { CreateOnboardingConfigurationRequest } from '@onefootprint/request-types/dashboard';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useDialogButtons } from './use-dialog-buttons';

const useCreatePlaybook = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create' });
  const queryClient = useQueryClient();
  const toast = useToast();
  const errorToast = useRequestErrorToast();
  const buttons = useDialogButtons();

  return useMutation({
    mutationFn: (body: CreateOnboardingConfigurationRequest) => {
      buttons.setBusy(true);
      return postOrgOnboardingConfigs({ body });
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
