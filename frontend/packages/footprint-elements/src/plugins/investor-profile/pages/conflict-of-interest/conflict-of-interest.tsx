import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import ConflictOfInterestForm from './components/conflict-of-interest-form';

const ConflictOfInterest = () => {
  const { t } = useTranslation('pages.conflict-of-interest-form');

  return (
    <>
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <ConflictOfInterestForm />
    </>
  );
};

export default ConflictOfInterest;
