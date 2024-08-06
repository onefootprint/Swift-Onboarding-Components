import { Dialog, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useUpdateAllowedDomains from '../../hooks/use-update-allowed-domains';
import Form from './components/form';

type CreateDialogProps = {
  allowedDomains?: string[];
  open: boolean;
  onClose: () => void;
};

type FormData = {
  url: string;
};

const CreateDialog = ({ open, onClose, allowedDomains = [] }: CreateDialogProps) => {
  const { t } = useTranslation('domain-restrictions');
  const domainMutation = useUpdateAllowedDomains();
  const toast = useToast();

  const handleSubmit = (formData: FormData) => {
    if (allowedDomains.includes(formData.url)) {
      toast.show({
        description: t('create-dialog.duplicate-url.description'),
        title: t('create-dialog.duplicate-url.title'),
        variant: 'error',
      });
      return;
    }
    domainMutation.mutate(
      {
        allowedOrigins: [...allowedDomains, formData.url],
      },
      {
        onSuccess: () => {
          onClose();
          toast.show({
            title: t('create-dialog.notifications.success.title'),
            description: t('create-dialog.notifications.success.description'),
          });
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      title={t('create-dialog.title')}
      primaryButton={{
        form: 'create-domain-restriction',
        label: t('create-dialog.save'),
        loading: domainMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: domainMutation.isLoading,
        label: t('create-dialog.cancel'),
        onClick: onClose,
      }}
      onClose={onClose}
      open={open}
    >
      <Form onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default CreateDialog;
