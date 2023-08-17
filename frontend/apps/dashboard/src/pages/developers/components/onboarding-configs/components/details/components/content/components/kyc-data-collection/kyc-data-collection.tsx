import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';
import CdoTagList from 'src/components/cdo-tag-list';

type KycDataCollectionProps = {
  onboardingConfig: OnboardingConfig;
};

const KycDataCollection = ({ onboardingConfig }: KycDataCollectionProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.details.kyc-data-collection',
  );
  const collectedDataTags = onboardingConfig.mustCollectData;
  const optionalCollectedDataTags = onboardingConfig.optionalData;
  const accessDataTags = onboardingConfig.canAccessData;

  return (
    <>
      <Field label={t('collected-data')}>
        <CdoTagList
          testID="kyc-collected-data"
          cdos={collectedDataTags}
          optionalCdos={optionalCollectedDataTags}
        />
      </Field>
      <Field label={t('accessed-data')}>
        {accessDataTags.length > 0 ? (
          <CdoTagList testID="kyc-accessed-data" cdos={accessDataTags} />
        ) : (
          t('none')
        )}
      </Field>
    </>
  );
};

export default KycDataCollection;
