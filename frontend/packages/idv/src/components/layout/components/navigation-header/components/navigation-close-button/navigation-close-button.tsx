import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import { IconButton, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';

import { NavigationHeaderCloseButtonProps } from '../../types';

type NavigationCloseButtonProps = Omit<
  NavigationHeaderCloseButtonProps,
  'variant'
> & {
  onClose?: () => void;
  hide?: boolean;
};
const NavigationCloseButton = ({
  onClose,
  confirmClose,
  hide,
}: NavigationCloseButtonProps) => {
  const { t } = useTranslation(
    'components.layout.navigation-header.close-button',
  );
  const confirmationDialog = useConfirmationDialog();

  if (hide) {
    return null;
  }

  const handleClick = () => {
    if (!confirmClose) {
      onClose?.();
      return;
    }

    confirmationDialog.open({
      title: t('confirm-dialog.title'),
      description: t('confirm-dialog.description'),
      primaryButton: {
        label: t('confirm-dialog.cta'),
        onClick: onClose,
      },
      secondaryButton: {
        label: t('confirm-dialog.cancel'),
      },
    });
  };

  return (
    <IconButton aria-label={t('aria-label')} onClick={handleClick}>
      <IcoClose24 />
    </IconButton>
  );
};

export default NavigationCloseButton;
