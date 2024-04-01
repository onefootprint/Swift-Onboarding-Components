import { Box, Dialog, InlineAlert, useToast } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Form from './components/form';
import type { ContactDialogData } from './contact-dialog.types';
import useContactForm from './hooks/use-contact-form';

type ContactDialogProps = {
  url: string;
  open: boolean;
  onClose: () => void;
};

const ContactDialog = ({ url, open, onClose }: ContactDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.banner.contact-us-dialog',
  });
  const submitFormMutation = useContactForm();
  const formId = 'support-dialog-id';
  const toast = useToast();
  const handleSubmit = (data: ContactDialogData) => {
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

  return (
    <Dialog
      open={open}
      size="compact"
      title={t('title')}
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
      onClose={onClose}
    >
      {submitFormMutation.isError && (
        <>
          <InlineAlert variant="error">{t('submit-error.title')}</InlineAlert>
          <Box marginBottom={5} />
        </>
      )}
      <Form onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default ContactDialog;
