import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import SectionHeader from 'src/components/section-header';

import Create from './components/create';
import Details from './components/details';
import Table from './components/table';
import useProxyConfigs from './hooks/use-proxy-configs';

const ProxyConfigs = () => {
  const { t } = useTranslation('pages.proxy-configs');
  const { data, errorMessage, isLoading } = useProxyConfigs();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box testID="proxy-configs-section" as="section">
        <SectionHeader title={t('title')} subtitle={t('subtitle')}>
          <Create />
        </SectionHeader>
        <Box marginTop={5} marginBottom={5} />
        <Table data={data} errorMessage={errorMessage} isLoading={isLoading} />
        <Details />
      </Box>
    </>
  );
};

export default ProxyConfigs;
