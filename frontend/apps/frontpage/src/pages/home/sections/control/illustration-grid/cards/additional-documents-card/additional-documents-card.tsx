import { Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAppearContent from '../../components/card-appear-content';
import CardContainer from '../../components/card-container/card-container';
import CardTitle from '../../components/card-title';

export const AdditionalDocumentsCard = () => {
  const [isExtraContentVisible, setIsExtraContentVisible] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.additional-documents',
  });

  return (
    <CardContainer size="compact">
      <CardTitle
        type="add"
        onClick={() => setIsExtraContentVisible(prev => !prev)}
      >
        {t('title')}
      </CardTitle>
      <Text variant="body-3" color="tertiary">
        {t('subtitle')}
      </Text>
      <CardAppearContent isVisible={isExtraContentVisible}>
        {t('extra-content')}
      </CardAppearContent>
    </CardContainer>
  );
};

export default AdditionalDocumentsCard;
