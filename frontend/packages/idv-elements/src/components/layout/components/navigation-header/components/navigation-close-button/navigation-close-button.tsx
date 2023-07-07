import { IcoClose24 } from '@onefootprint/icons';
import { IconButton, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';

import { NavigationHeaderCloseButtonProps } from '../../types';

type NavigationCloseButtonProps = Omit<
  NavigationHeaderCloseButtonProps,
  'variant'
> & {
  onClose?: () => void;
};
const NavigationCloseButton = ({
  onClose,
  confirmClose,
}: NavigationCloseButtonProps) => {
  const confirmationDialog = useConfirmationDialog();

  const handleClick = () => {
    if (!confirmClose) {
      onClose?.();
      return;
    }

    confirmationDialog.open({
      title: 'Are you sure?',
      description: 'Leaving this flow will not save your data.',
      primaryButton: {
        label: 'Yes',
        onClick: onClose,
      },
      secondaryButton: {
        label: 'No',
      },
    });
  };

  return (
    <IconButton
      aria-label="Close"
      onClick={handleClick}
      testID="navigation-close-button"
    >
      <IcoClose24 />
    </IconButton>
  );
};

export default NavigationCloseButton;
