import { Box } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Section from '../section';
import DuplicateData from './components/duplicate-data';
import RiskSignalsList from './components/risk-signals-list';

const RiskSignals = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals',
  });

  return (
    <Section title={t('title')}>
      <Box display="flex" flexDirection="column" gap={7}>
        <RiskSignalsList />
        <DuplicateData />
      </Box>
    </Section>
  );
};

export default RiskSignals;
