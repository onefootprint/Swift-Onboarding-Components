import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption, OnboardingConfig } from '@onefootprint/types';
import React from 'react';
import { Field } from 'src/components';
import { isKybCdo } from 'src/pages/developers/components/onboarding-configs/utils/is-kyb-onboarding-config';

import TagList from '../../../../../tag-list';

type KybDataCollectionProps = {
  onboardingConfig: OnboardingConfig;
};

const KybDataCollection = ({ onboardingConfig }: KybDataCollectionProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs-new.details.kyb-data-collection',
  );
  const collectedKybDataTags = onboardingConfig.mustCollectData
    .filter(data => isKybCdo(data))
    .map((data: CollectedDataOption) => allT(`cdo.${data}`));
  const canAccessAllData =
    onboardingConfig.canAccessData.filter(data => isKybCdo(data)).length > 0;

  return (
    <>
      <Field label={t('collected-data')}>
        <TagList testID="kyb-collected-data" items={collectedKybDataTags} />
      </Field>
      <Field label={t('accessed-data')}>
        {canAccessAllData ? t('all') : t('none')}
      </Field>
    </>
  );
};

export default KybDataCollection;
