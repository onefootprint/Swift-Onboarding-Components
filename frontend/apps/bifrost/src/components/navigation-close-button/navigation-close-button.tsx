import { useFootprintJs } from 'footprint-provider';
import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { IconButton, useConfirmationDialog } from 'ui';

export type NavigationCloseButtonProps = {
  confirm?: boolean;
  onClick?: () => void;
};

const NavigationCloseButton = ({
  confirm,
  onClick,
}: NavigationCloseButtonProps) => {
  const footprint = useFootprintJs();
  const confirmationDialog = useConfirmationDialog();

  const showConfirmation = (callback: () => void) => {
    confirmationDialog.open({
      title: 'Are you sure?',
      description: 'Leaving this flow will not save your data.',
      primaryButton: {
        label: 'Yes',
        onClick: callback,
      },
      secondaryButton: {
        label: 'No',
      },
    });
  };

  const close = () => {
    footprint.cancel();
    footprint.close();
  };

  const handleClick = () => {
    if (confirm) {
      showConfirmation(close);
      onClick?.();
    } else {
      close();
    }
  };

  return (
    <IconButton
      aria-label="Close window"
      iconComponent={IcoClose24}
      onClick={handleClick}
    />
  );
};

export default NavigationCloseButton;
