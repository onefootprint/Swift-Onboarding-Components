import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import NetWorthForm from './components/net-worth-form';

const NetWorth = () => {
  const { t } = useTranslation('pages.net-worth');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <NetWorthForm />
    </>
  );
};

export default NetWorth;
