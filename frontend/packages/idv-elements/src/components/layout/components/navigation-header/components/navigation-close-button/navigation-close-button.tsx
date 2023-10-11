import type { Color } from '@onefootprint/design-tokens';
import { IcoClose24 } from '@onefootprint/icons';
import { IconButton, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';

import type { NavigationHeaderCloseButtonProps } from '../../types';

type NavigationCloseButtonProps = Omit<
  NavigationHeaderCloseButtonProps,
  'variant'
> & {
  onClose?: () => void;
  color?: Color;
};
const NavigationCloseButton = ({
  onClose,
  confirmClose,
  color,
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
      <IcoClose24 color={color} />
    </IconButton>
  );
};

export default NavigationCloseButton;
