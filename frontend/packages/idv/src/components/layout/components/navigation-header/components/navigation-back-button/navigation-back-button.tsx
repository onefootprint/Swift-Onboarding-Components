import type { Color } from '@onefootprint/design-tokens';
import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type NavigationBackButtonProps = {
  onBack?: () => void;
  color?: Color;
};

const NavigationBackButton = ({ onBack, color }: NavigationBackButtonProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.navigation-header.back-button',
  });

  return (
    <IconButton aria-label={t('aria-label')} onClick={onBack} testID="navigation-back-button">
      <IcoChevronLeftBig24 color={color} />
    </IconButton>
  );
};

export default NavigationBackButton;
