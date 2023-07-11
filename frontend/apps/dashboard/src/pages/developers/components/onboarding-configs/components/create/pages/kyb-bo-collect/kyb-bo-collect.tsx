import { useTranslation } from '@onefootprint/hooks';
import { Divider } from '@onefootprint/ui';
import React from 'react';

import FormTitle from '../../components/form-title';
import KycCollectForm from '../../components/kyc-collect-form';

const KybBoCollect = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create.kyb-bo-collect-form',
  );

  const getTitle = () => (
    <>
      <FormTitle title={t('title')} description={t('description')} />
      <Divider />
      <FormTitle title={t('step-up')} description={t('step-up-description')} />
    </>
  );

  return <KycCollectForm title={getTitle()} />;
};

export default KybBoCollect;
