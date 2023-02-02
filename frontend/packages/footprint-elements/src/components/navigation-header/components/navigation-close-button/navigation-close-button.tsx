import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import { IconButton, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';

import { useFootprintProvider } from '../../../footprint-provider';

export type NavigationCloseButtonProps = {
  confirm?: boolean;
  onClick?: () => void;
};

const NavigationCloseButton = ({
  confirm,
  onClick,
}: NavigationCloseButtonProps) => {
  const footprint = useFootprintProvider();
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
    <IconButton aria-label="Close window" onClick={handleClick}>
      <IcoClose24 />
    </IconButton>
  );
};

export default NavigationCloseButton;
