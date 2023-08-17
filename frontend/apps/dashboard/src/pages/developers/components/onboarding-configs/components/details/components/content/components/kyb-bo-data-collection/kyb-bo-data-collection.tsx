import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';
import CdoTagList from 'src/components/cdo-tag-list';
import { isKybCdo } from 'src/pages/developers/components/onboarding-configs/utils/is-kyb-onboarding-config';

type KybBoDataCollectionProps = {
  onboardingConfig: OnboardingConfig;
};

const KybBoDataCollection = ({
  onboardingConfig,
}: KybBoDataCollectionProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.details.kyb-bo-data-collection',
  );
  const collectedKycDataTags = onboardingConfig.mustCollectData.filter(
    data => !isKybCdo(data),
  );
  const optionalCollectedKycDataTags = onboardingConfig.optionalData.filter(
    data => !isKybCdo(data),
  );
  const accessKycDataTags = onboardingConfig.canAccessData.filter(
    data => !isKybCdo(data),
  );

  return (
    <>
      <Field label={t('collected-data')}>
        <CdoTagList
          testID="kyb-bo-collected-data"
          cdos={collectedKycDataTags}
          optionalCdos={optionalCollectedKycDataTags}
        />
      </Field>
      <Field label={t('accessed-data')}>
        {accessKycDataTags.length > 0 ? (
          <CdoTagList testID="kyb-bo-accessed-data" cdos={accessKycDataTags} />
        ) : (
          t('none')
        )}
      </Field>
    </>
  );
};

export default KybBoDataCollection;
