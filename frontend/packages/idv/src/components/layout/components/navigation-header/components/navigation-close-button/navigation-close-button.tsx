import type { Color } from '@onefootprint/design-tokens';
import { IcoClose24 } from '@onefootprint/icons';
import { IconButton, useConfirmationDialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import type { NavigationHeaderCloseButtonProps } from '../../types';

type NavigationCloseButtonProps = Omit<NavigationHeaderCloseButtonProps, 'variant'> & {
  onClose?: () => void;
  color?: Color;
};
const NavigationCloseButton = ({ onClose, confirmClose, color }: NavigationCloseButtonProps) => {
  const confirmationDialog = useConfirmationDialog();
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.confirmation-dialog',
  });

  const handleClick = () => {
    if (!confirmClose) {
      onClose?.();
      return;
    }

    confirmationDialog.open({
      title: t('title'),
      description: t('description'),
      primaryButton: {
        label: t('confirm'),
        onClick: onClose,
      },
      secondaryButton: {
        label: t('cancel'),
      },
    });
  };

  return (
    <IconButton aria-label="Close" onClick={handleClick} testID="navigation-close-button">
      <IcoClose24 color={color} />
    </IconButton>
  );
};

export default NavigationCloseButton;
