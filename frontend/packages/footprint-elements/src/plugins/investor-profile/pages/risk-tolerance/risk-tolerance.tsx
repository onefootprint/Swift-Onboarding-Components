import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import RiskToleranceForm from './components/risk-tolerance-form';

const RiskTolerance = () => {
  const { t } = useTranslation('pages.risk-tolerance');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <RiskToleranceForm />
    </>
  );
};

export default RiskTolerance;
