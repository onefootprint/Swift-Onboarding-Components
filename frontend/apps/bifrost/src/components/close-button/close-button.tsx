import { useFootprintJs } from 'footprint-provider';
import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { IconButton, useConfirmationDialog } from 'ui';

const CloseButton = () => {
  const confirmationDialog = useConfirmationDialog();
  const footprint = useFootprintJs();

  const handleCloseClick = () => {
    confirmationDialog.open({
      title: 'Are you sure?',
      description: 'Leaving this flow will not save your data.',
      primaryButton: {
        label: 'Yes',
        onClick: () => {
          footprint.onUserCancel();
          footprint.onClose();
        },
      },
      secondaryButton: {
        label: 'No',
      },
    });
  };

  return (
    <IconButton
      iconComponent={IcoClose24}
      aria-label="Close window"
      onClick={handleCloseClick}
    />
  );
};

export default CloseButton;
