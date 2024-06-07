import { Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container';
import CardTitle from '../../components/card-title';

const InvestorQuestionsCard = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.investor-profile-questions',
  });

  const [isExtraContentVisible, setIsExtraContentVisible] = useState(false);

  return (
    <CardContainer size="compact">
      <CardTitle type="add" onClick={() => setIsExtraContentVisible(prev => !prev)}>
        {t('title')}
      </CardTitle>
      <Text variant="body-3" color="tertiary">
        {t('subtitle')}
      </Text>
      <CardAppearContent isVisible={isExtraContentVisible}>{t('extra-content')}</CardAppearContent>
    </CardContainer>
  );
};

export default InvestorQuestionsCard;
