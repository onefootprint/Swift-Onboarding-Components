import { Box, Dialog, InlineAlert, useToast } from '@onefootprint/ui';
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
    keyPrefix: 'components.contact-us-dialog',
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
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        label: t('send-button'),
        form: formId,
        type: 'submit',
        loading: submitFormMutation.isPending,
      }}
      secondaryButton={{
        label: t('cancel-button'),
        onClick: onClose,
        form: formId,
        type: 'reset',
        disabled: submitFormMutation.isPending,
      }}
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
