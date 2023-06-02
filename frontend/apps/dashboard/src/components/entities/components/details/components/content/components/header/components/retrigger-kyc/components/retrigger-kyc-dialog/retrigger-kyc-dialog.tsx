import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { Dialog, useToast } from '@onefootprint/ui';
import React from 'react';

import useEntityId from '@/entity/hooks/use-entity-id';

import useRetriggerKYC from '../hooks/use-retrigger-kyc';
import RetriggerKYCForm, {
  RetriggerKYCFormData,
} from './components/retrigger-kyc-form';

export type RetriggerKYCDialogProps = {
  open: boolean;
  onClose: () => void;
};

const RetriggerKYCDialog = ({ open, onClose }: RetriggerKYCDialogProps) => {
  const { t } = useTranslation('pages.entity.retrigger-kyc');
  const submitRetriggerKYCMutation = useRetriggerKYC();
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();

  const entityId = useEntityId();

  const handleSubmit = (data: RetriggerKYCFormData) => {
    const { kind, note } = data;
    submitRetriggerKYCMutation.mutate(
      {
        entityId,
        kind,
        note,
      },
      {
        onSuccess: () => {
          toast.show({
            description: t('dialog.success-toast.description'),
            title: t('dialog.success-toast.title'),
            variant: 'default',
          });
          onClose();
        },
        onError: showRequestErrorToast,
      },
    );
  };
  return (
    <Dialog
      size="compact"
      title={t('dialog.title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'retrigger-kyc-form',
        label: t('dialog.send-request'),
        loading: submitRetriggerKYCMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('dialog.cancel'),
        onClick: onClose,
        disabled: submitRetriggerKYCMutation.isLoading,
      }}
    >
      <RetriggerKYCForm formId="retrigger-kyc-form" onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default RetriggerKYCDialog;
