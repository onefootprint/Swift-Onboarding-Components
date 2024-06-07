'use client';

import { useState } from 'react';

type ConfirmationButton = {
  label: string;
  onClick?: () => void;
};

export type ConfirmationDialog = {
  description: string;
  primaryButton: ConfirmationButton;
  secondaryButton: ConfirmationButton;
  title: string;
};

const useLocalConfirmationDialog = () => {
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialog | null>(null);

  const open = (nextConfirmationDialog: ConfirmationDialog) => {
    setConfirmationDialog(nextConfirmationDialog);
  };

  const hide = () => setConfirmationDialog(null);

  return { confirmationDialog, open, hide };
};

export default useLocalConfirmationDialog;
