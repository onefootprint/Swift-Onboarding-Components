import { useTranslation } from '@onefootprint/hooks';
import { Box, Divider } from '@onefootprint/ui';
import React from 'react';

import FormTitle from '../../components/form-title';
import KycCollectForm from '../../components/kyc-collect-form';

const KybBoCollect = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create.kyb-bo-collect-form',
  );

  return (
    <>
      <FormTitle title={t('title')} description={t('description')} />
      <Divider />
      <Box sx={{ margin: 5 }} />
      <FormTitle
        title={t('subtitle')}
        description={t('description-subtitle')}
      />
      <KycCollectForm />
    </>
  );
};

export default KybBoCollect;
