import type { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import React from 'react';

export type NavigationBackButtonProps = {
  onBack?: () => void;
  color?: Color;
};

const NavigationBackButton = ({ onBack, color }: NavigationBackButtonProps) => {
  const { t } = useTranslation(
    'components.layout.navigation-header.back-button',
  );

  return (
    <IconButton
      aria-label={t('aria-label')}
      onClick={onBack}
      testID="navigation-back-button"
    >
      <IcoChevronLeftBig24 color={color} />
    </IconButton>
  );
};

export default NavigationBackButton;
