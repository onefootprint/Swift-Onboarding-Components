import { Dialog, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type ConfirmationDialogProps = {
  children: React.ReactNode;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

const ConfirmationDialog = ({ children, isLoading, onClose, onConfirm, open, title }: ConfirmationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      size="compact"
      open={open}
      onClose={onClose}
      title={title}
      primaryButton={{
        label: t('confirm.cta'),
        loading: isLoading,
        onClick: onConfirm,
      }}
      secondaryButton={{
        disabled: isLoading,
        label: t('confirm.cancel'),
        onClick: onClose,
      }}
    >
      <Text variant="body-2" color="secondary" textAlign="center">
        {children}
      </Text>
    </Dialog>
  );
};

export default ConfirmationDialog;
