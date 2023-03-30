import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption, OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';
import { isKybCdo } from 'src/pages/developers/components/onboarding-configs/utils/is-kyb-onboarding-config';

import TagList from '../../../../../tag-list';

type KybBoDataCollectionProps = {
  onboardingConfig: OnboardingConfig;
};

const KybBoDataCollection = ({
  onboardingConfig,
}: KybBoDataCollectionProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs-new.details.kyb-bo-data-collection',
  );

  const collectedKycDataTags = onboardingConfig.mustCollectData
    .filter(data => !isKybCdo(data))
    .map((data: CollectedDataOption) => allT(`cdo.${data}`));
  const accessKycDataTags = onboardingConfig.canAccessData
    .filter(data => !isKybCdo(data))
    .map((data: CollectedDataOption) => allT(`cdo.${data}`));

  return (
    <>
      <Field label={t('collected-data')}>
        <TagList testID="kyb-bo-collected-data" items={collectedKycDataTags} />
      </Field>
      <Field label={t('accessed-data')}>
        {accessKycDataTags.length > 0 ? (
          <TagList testID="kyb-bo-accessed-data" items={accessKycDataTags} />
        ) : (
          t('none')
        )}
      </Field>
    </>
  );
};

export default KybBoDataCollection;
