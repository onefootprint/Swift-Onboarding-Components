import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import FormTitle from '../../components/form-title';
import KycCollectForm from '../../components/kyc-collect-form';

const KycCollect = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-new.kyc-collect-form',
  );

  return (
    <>
      <FormTitle title={t('title')} description={t('description')} />
      <KycCollectForm />
    </>
  );
};

export default KycCollect;
