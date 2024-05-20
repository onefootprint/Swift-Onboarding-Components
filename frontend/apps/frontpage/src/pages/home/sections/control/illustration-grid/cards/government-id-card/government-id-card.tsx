import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CardContainer from '../../components/card-container/card-container';
import CardTitle from '../../components/card-title';

export const GovernmentIdCard = ({ className }: { className?: string }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.control.illustration.government-issued-id',
  });

  return (
    <CardContainer size="compact" className={className}>
      <CardTitle type="add">{t('title')}</CardTitle>
      <Text variant="body-3" color="tertiary">
        {t('subtitle')}
      </Text>
    </CardContainer>
  );
};

export default GovernmentIdCard;
