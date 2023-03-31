import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption, OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';

import TagList from '../../../../../tag-list';

type KycDataCollectionProps = {
  onboardingConfig: OnboardingConfig;
};

const KycDataCollection = ({ onboardingConfig }: KycDataCollectionProps) => {
  const { allT, t } = useTranslation(
    'pages.developers.onboarding-configs.details.kyc-data-collection',
  );

  const collectedDataTags = onboardingConfig.mustCollectData.map(
    (data: CollectedDataOption) => allT(`cdo.${data}`),
  );
  const accessDataTags = onboardingConfig.canAccessData.map(
    (data: CollectedDataOption) => allT(`cdo.${data}`),
  );

  return (
    <>
      <Field label={t('collected-data')}>
        <TagList testID="kyc-collected-data" items={collectedDataTags} />
      </Field>
      <Field label={t('accessed-data')}>
        {accessDataTags.length > 0 ? (
          <TagList testID="kyc-accessed-data" items={accessDataTags} />
        ) : (
          t('none')
        )}
      </Field>
    </>
  );
};

export default KycDataCollection;
