import constate from 'constate';
import React from 'react';

import { Typography } from '../../components';
import Dialog from '../../components/dialog';
import useConfirmationDialog from './hooks/use-confirmation-dialog';

export type ConfirmationDialogProps = {
  children: React.ReactNode;
};

export type ConfirmationDialogProviderProps = {
  children: React.ReactNode;
};

const [Provider, useContext] = constate(useConfirmationDialog);

const ConfirmationDialog = ({ children }: ConfirmationDialogProps) => {
  const { confirmationDialog, hide } = useContext();

  const handleButtonClick = (onClick?: () => void) => () => {
    hide();
    onClick?.();
  };

  return (
    <>
      {children}
      {confirmationDialog ? (
        <Dialog
          open
          size="small"
          title={confirmationDialog.title}
          onClose={hide}
          primaryButton={{
            label: confirmationDialog.primaryButton.label,
            onClick: handleButtonClick(
              confirmationDialog.primaryButton.onClick,
            ),
          }}
          secondaryButton={{
            label: confirmationDialog.secondaryButton.label,
            onClick: handleButtonClick(
              confirmationDialog.secondaryButton.onClick,
            ),
          }}
        >
          <Typography variant="body-2" color="secondary">
            {confirmationDialog.description}
          </Typography>
        </Dialog>
      ) : null}
    </>
  );
};

const ConfirmationDialogProvider = ({
  children,
}: ConfirmationDialogProviderProps) => (
  <Provider>
    <ConfirmationDialog>{children}</ConfirmationDialog>
  </Provider>
);

export default ConfirmationDialogProvider;
export { useContext as useConfirmationDialog };
