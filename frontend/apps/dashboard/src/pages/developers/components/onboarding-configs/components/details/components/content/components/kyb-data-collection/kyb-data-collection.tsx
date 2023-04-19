import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';
import CdoTagList from 'src/components/cdo-tag-list';
import { isKybCdo } from 'src/pages/developers/components/onboarding-configs/utils/is-kyb-onboarding-config';

type KybDataCollectionProps = {
  onboardingConfig: OnboardingConfig;
};

const KybDataCollection = ({ onboardingConfig }: KybDataCollectionProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.details.kyb-data-collection',
  );
  const collectedKybDataTags = onboardingConfig.mustCollectData.filter(data =>
    isKybCdo(data),
  );
  const canAccessAllData =
    onboardingConfig.canAccessData.filter(data => isKybCdo(data)).length > 0;

  return (
    <>
      <Field label={t('collected-data')}>
        <CdoTagList testID="kyb-collected-data" cdos={collectedKybDataTags} />
      </Field>
      <Field label={t('accessed-data')}>
        {canAccessAllData ? t('all') : t('none')}
      </Field>
    </>
  );
};

export default KybDataCollection;
