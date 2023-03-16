import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InvestmentGoalsForm from './components/investment-goals-form';

const InvestmentGoals = () => {
  const { t } = useTranslation('pages.investment-goals');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <InvestmentGoalsForm />
    </>
  );
};

export default InvestmentGoals;
