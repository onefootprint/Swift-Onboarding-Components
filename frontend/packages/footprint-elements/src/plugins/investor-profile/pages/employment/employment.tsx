import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import EmploymentForm from './components/employment-form';

const Employment = () => {
  const { t } = useTranslation('pages.employment');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <EmploymentForm />
    </>
  );
};

export default Employment;
