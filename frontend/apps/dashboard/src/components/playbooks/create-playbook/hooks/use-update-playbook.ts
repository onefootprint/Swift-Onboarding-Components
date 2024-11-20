import { putOrgPlaybooksByPlaybookId } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { PutOrgPlaybooksByPlaybookIdData } from '@onefootprint/request-types/dashboard';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { useDialogButtons } from './use-dialog-buttons';

const useCreatePlaybook = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'update' });
  const toast = useToast();
  const router = useRouter();
  const errorToast = useRequestErrorToast();
  const buttons = useDialogButtons();

  return useMutation({
    mutationFn: (payload: PutOrgPlaybooksByPlaybookIdData) => {
      buttons.setBusy(true);
      return putOrgPlaybooksByPlaybookId(payload);
    },
    onSuccess: response => {
      console.log(response);
      toast.show({
        title: t('feedback.success.title'),
        description: t('feedback.success.description'),
      });
      if (response.data) {
        router.replace(`/playbooks/${response.data.id}`);
      }
    },
    onError: errorToast,
    onSettled: () => {
      buttons.setBusy(false);
    },
  });
};

export default useCreatePlaybook;
