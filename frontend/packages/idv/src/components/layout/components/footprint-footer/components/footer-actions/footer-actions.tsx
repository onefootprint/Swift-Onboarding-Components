import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import LanguagesSubmenu from './components/languages-submenu';
import SupportSubmenu from './components/support-submenu';

type FooterActionsProps = {
  onWhatsThisClick?: () => void;
  config?: PublicOnboardingConfig;
};

const handleRedirect = (url: string) => {
  window.open(url, '_blank');
};

const FooterActions = ({ onWhatsThisClick, config }: FooterActionsProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.layout',
  });

  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        <IcoDotsHorizontal24 />
      </Dropdown.Trigger>
      <Dropdown.Content align="end">
        <Dropdown.Group>
          <Dropdown.Item onClick={onWhatsThisClick} size="compact">
            {t('whats-this')}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleRedirect(`${FRONTPAGE_BASE_URL}/privacy-policy`)} size="compact">
            {t('privacy')}
          </Dropdown.Item>
          <LanguagesSubmenu />
          <SupportSubmenu config={config} />
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default FooterActions;
