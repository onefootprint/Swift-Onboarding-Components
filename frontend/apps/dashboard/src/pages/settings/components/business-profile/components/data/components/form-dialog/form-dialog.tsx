import { useTranslation } from '@onefootprint/hooks';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

export type FormDialogProps = {
  children: React.ReactNode;
  id: string;
  loading?: boolean;
  onClose: () => void;
  open: boolean;
  title: string;
};

const FormDialog = ({
  children,
  id,
  loading,
  onClose,
  open,
  title,
}: FormDialogProps) => {
  const { t } = useTranslation();

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
    >
      {children}
    </Dialog>
  );
};

export default FormDialog;
