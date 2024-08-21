import { Dialog } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';

export type FormDialogProps = {
  children: React.ReactNode;
  id: string;
  loading?: boolean;
  onClose: () => void;
  onDeleteData?: () => void;
  open: boolean;
  title: string;
};

const FormDialog = ({ children, id, loading, onClose, onDeleteData, open, title }: FormDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.dialog',
  });

  return (
    <Dialog
      size="compact"
      title={title}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: id,
        label: t('save'),
        loading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: loading,
        label: t('cancel'),
        onClick: onClose,
      }}
      linkButton={
        onDeleteData
          ? {
              disabled: loading,
              label: t('delete'),
              onClick: onDeleteData,
            }
          : undefined
      }
    >
      {children}
    </Dialog>
  );
};

export default FormDialog;
