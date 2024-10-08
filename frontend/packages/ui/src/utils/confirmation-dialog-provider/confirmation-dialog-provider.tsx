import constate from 'constate';
import type React from 'react';

import Dialog from '../../components/dialog';
import Text from '../../components/text';
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
      {confirmationDialog && (
        <Dialog
          open
          isConfirmation
          size="compact"
          title={confirmationDialog.title}
          onClose={hide}
          primaryButton={{
            label: confirmationDialog.primaryButton.label,
            onClick: handleButtonClick(confirmationDialog.primaryButton.onClick),
          }}
          secondaryButton={{
            label: confirmationDialog.secondaryButton.label,
            onClick: handleButtonClick(confirmationDialog.secondaryButton.onClick),
          }}
        >
          <Text variant="body-2" color="secondary" textAlign="center">
            {confirmationDialog.description}
          </Text>
        </Dialog>
      )}
    </>
  );
};

const ConfirmationDialogProvider = ({ children }: ConfirmationDialogProviderProps) => (
  <Provider>
    <ConfirmationDialog>{children}</ConfirmationDialog>
  </Provider>
);

export default ConfirmationDialogProvider;
export { useContext as useConfirmationDialog };
