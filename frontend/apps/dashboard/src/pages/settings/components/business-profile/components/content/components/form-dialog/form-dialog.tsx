import { Dialog } from '@onefootprint/ui';
import React from 'react';
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

const FormDialog = ({
  children,
  id,
  loading,
  onClose,
  onDeleteData,
  open,
  title,
}: FormDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.dialog',
  });

  return (
    <Dialog
      open={open}
      size="compact"
      title={title}
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
      onClose={onClose}
    >
      {children}
    </Dialog>
  );
};

export default FormDialog;
