import { Dialog, Text } from '@onefootprint/ui';
import type React from 'react';
import { useTranslation } from 'react-i18next';

export type ConfirmationDialogProps = {
  children: React.ReactNode;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

const ConfirmationDialog = ({ children, isPending, onClose, onConfirm, open, title }: ConfirmationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      size="compact"
      open={open}
      onClose={onClose}
      title={title}
      primaryButton={{
        label: t('confirm.cta'),
        loading: isPending,
        onClick: onConfirm,
      }}
      secondaryButton={{
        disabled: isPending,
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
