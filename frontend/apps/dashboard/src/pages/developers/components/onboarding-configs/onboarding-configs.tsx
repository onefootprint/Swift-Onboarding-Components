import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import SectionHeader from 'src/components/section-header';

import Create from './components/create';
import Details from './components/details';
import Table from './components/table';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const OnboardingConfigs = () => {
  const { t } = useTranslation('pages.developers.onboarding-configs-new');
  const { data, errorMessage, isLoading, refetch } = useOnboardingConfigs();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box testID="onboarding-configs-section" as="section">
        <SectionHeader title={t('title')} subtitle={t('subtitle')}>
          <Create onCreate={refetch} />
        </SectionHeader>
        <Box sx={{ marginY: 5 }} />
        <Table data={data} errorMessage={errorMessage} isLoading={isLoading} />
        <Details />
      </Box>
    </>
  );
};

export default OnboardingConfigs;
