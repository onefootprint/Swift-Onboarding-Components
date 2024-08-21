import { Dialog } from '@onefootprint/ui';
import type React from 'react';

type DialogWrapperProps = {
  children: React.ReactNode;
  id: string;
  labelLink?: string;
  labelPrimary?: string;
  labelSecondary?: string;
  loading?: boolean;
  onClose: () => void;
  onDeleteData?: () => void;
  open: boolean;
  title: string;
};

const DialogWrapper = ({
  children,
  id,
  labelLink,
  labelPrimary,
  labelSecondary,
  loading,
  onClose,
  onDeleteData,
  open,
  title,
}: DialogWrapperProps) => (
  <Dialog
    size="compact"
    title={title}
    onClose={onClose}
    open={open}
    primaryButton={{
      form: id,
      label: labelPrimary || 'save',
      loading,
      type: 'submit',
    }}
    secondaryButton={{
      disabled: loading,
      label: labelSecondary || 'cancel',
      onClick: onClose,
    }}
    linkButton={
      onDeleteData
        ? {
            disabled: loading,
            label: labelLink || 'delete',
            onClick: onDeleteData,
          }
        : undefined
    }
  >
    {children}
  </Dialog>
);
export default DialogWrapper;
