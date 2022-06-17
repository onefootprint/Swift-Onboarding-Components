import { useFootprintJs } from 'footprint-provider';
import IcoClose16 from 'icons/ico/ico-close-16';
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
        onClick: footprint.close,
      },
      secondaryButton: {
        label: 'No',
      },
    });
  };

  return (
    <IconButton
      iconComponent={IcoClose16}
      ariaLabel="Close window"
      onClick={handleCloseClick}
    />
  );
};

export default CloseButton;
