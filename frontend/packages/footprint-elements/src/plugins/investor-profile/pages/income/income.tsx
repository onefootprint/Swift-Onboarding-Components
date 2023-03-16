import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import IncomeForm from './components/income-form';

const Income = () => {
  const { t } = useTranslation('pages.income');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <IncomeForm />
    </>
  );
};

export default Income;
