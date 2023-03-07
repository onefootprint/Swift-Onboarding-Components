import { useTranslation } from '@onefootprint/hooks';
import { Box, Dialog, InlineAlert, useToast } from '@onefootprint/ui';
import React from 'react';

import { ContactFormData } from '../contact-form.types';
import Form from '../form';
import useContactForm from '../hooks/use-contact-form';

type ContactDialogProps = {
  url: string;
  open: boolean;
  onClose: () => void;
};

const ContactDialog = ({ url, open, onClose }: ContactDialogProps) => {
  const { t } = useTranslation('components.sandbox-banner.contact-us-dialog');
  const submitFormMutation = useContactForm();
  const toast = useToast();
  const handleSubmit = (data: ContactFormData) => {
    submitFormMutation.mutate(
      { url, data },
      {
        onSuccess() {
          onClose();
          toast.show({
            title: t('submit-success.title'),
            description: t('submit-success.description'),
          });
        },
      },
    );
  };
  const formId = 'support-dialog-id';

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        label: t('send-button'),
        form: formId,
        type: 'submit',
        loading: submitFormMutation.isLoading,
      }}
      secondaryButton={{
        label: t('cancel-button'),
        onClick: onClose,
        form: formId,
        type: 'reset',
        disabled: submitFormMutation.isLoading,
      }}
    >
      {submitFormMutation.isError && (
        <>
          <InlineAlert variant="error">{t('submit-error.title')}</InlineAlert>
          <Box sx={{ marginBottom: 5 }} />
        </>
      )}
      <Form onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default ContactDialog;
