import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import BrokerageEmploymentForm from './components/brokerage-employment-form';

const BrokerageEmployment = () => {
  const { t } = useTranslation('pages.brokerage-employment');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <BrokerageEmploymentForm />
    </>
  );
};

export default BrokerageEmployment;
