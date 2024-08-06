import { Box } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Section from '../section';
import RiskSignalsList from './components/risk-signals-list';

const RiskSignals = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals',
  });

  return (
    <Section title={t('title')}>
      <Box display="flex" flexDirection="column">
        <RiskSignalsList />
      </Box>
    </Section>
  );
};

export default RiskSignals;
