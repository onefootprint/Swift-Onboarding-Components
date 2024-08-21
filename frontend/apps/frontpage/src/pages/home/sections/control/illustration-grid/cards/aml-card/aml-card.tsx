import { Toggle } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container';

const AmlCard = () => {
  const [isToggled, setIsToggled] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.anti-money-laundering',
  });
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsToggled(event.target.checked);
  };
  return (
    <CardContainer>
      <Toggle label={t('toggle.title')} hint={t('toggle.subtitle')} checked={isToggled} onChange={handleToggle} />
      <CardAppearContent isVisible={isToggled}>{t('extra-content')}</CardAppearContent>
    </CardContainer>
  );
};

export default AmlCard;
