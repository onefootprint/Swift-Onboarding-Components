import constate from 'constate';
import React from 'react';

import Dialog from '../../components/dialog';
import Typography from '../../components/typography';
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
          disableResponsiveness
          isConfirmation
          size="compact"
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
          <Typography
            variant="body-2"
            color="secondary"
            sx={{ textAlign: 'center' }}
          >
            {confirmationDialog.description}
          </Typography>
        </Dialog>
      )}
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
