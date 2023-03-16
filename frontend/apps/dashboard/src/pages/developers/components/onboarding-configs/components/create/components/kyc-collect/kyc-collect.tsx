import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import FormTitle from '../form-title';
import KycCollectFormElems from '../kyc-collect-form';

const KycCollect = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog.kyc-collect-form',
  );

  return (
    <>
      <FormTitle title={t('title')} description={t('description')} />
      <KycCollectFormElems />
    </>
  );
};

export default KycCollect;
