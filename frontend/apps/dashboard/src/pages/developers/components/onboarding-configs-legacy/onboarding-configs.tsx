import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Box } from '@onefootprint/ui';
import React from 'react';
import SectionHeader from 'src/components/section-header';

import Create from './components/create';
import OnboardingConfigsData from './components/onboarding-configs-data';
import OnboardingConfigsError from './components/onboarding-configs-error';
import OnboardingConfigsLoading from './components/onboarding-configs-loading';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const OnboardingConfigs = () => {
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const { data, error, isLoading, refetch } = useOnboardingConfigs();

  return (
    <section data-testid="onboarding-configs-section">
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
        <Create onCreate={refetch} />
      </SectionHeader>
      <Box sx={{ marginY: 5 }} />
      {data && <OnboardingConfigsData data={data} />}
      {isLoading && <OnboardingConfigsLoading />}
      {error && <OnboardingConfigsError message={getErrorMessage(error)} />}
    </section>
  );
};

export default OnboardingConfigs;
