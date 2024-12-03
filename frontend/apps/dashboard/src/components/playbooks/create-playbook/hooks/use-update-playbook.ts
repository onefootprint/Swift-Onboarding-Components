import { putOrgPlaybooksById } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { PutOrgPlaybooksByIdData } from '@onefootprint/request-types/dashboard';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { useDialogButtons } from './use-dialog-buttons';

const useCreatePlaybook = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'update' });
  const toast = useToast();
  const router = useRouter();
  const errorToast = useRequestErrorToast();
  const buttons = useDialogButtons();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PutOrgPlaybooksByIdData) => {
      buttons.setBusy(true);
      return putOrgPlaybooksById(payload);
    },
    onSuccess: response => {
      console.log(response);
      toast.show({
        title: t('feedback.success.title'),
        description: t('feedback.success.description'),
      });
      if (response.data) {
        router.replace(`/playbooks/${response.data.playbookId}`);
      }
    },
    onError: errorToast,
    onSettled: () => {
      buttons.setBusy(false);
      queryClient.invalidateQueries();
    },
  });
};

export default useCreatePlaybook;
