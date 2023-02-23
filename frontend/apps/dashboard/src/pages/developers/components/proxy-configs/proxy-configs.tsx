import { useTranslation } from '@onefootprint/hooks';
import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import SectionHeader from 'src/components/section-header';

import Create from './components/create';
import Table from './components/table';
import useProxyConfigs from './hooks/use-proxy-configs';

const ProxyConfigs = () => {
  const { t } = useTranslation('pages.proxy-configs');
  const query = useProxyConfigs();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Box testID="proxy-configs-section" as="section">
        <SectionHeader title={t('title')} subtitle={t('subtitle')}>
          <Create />
        </SectionHeader>
        <Box sx={{ marginY: 5 }} />
        <Table
          data={query.data}
          errorMessage={query.errorMessage}
          isLoading={query.isLoading}
        />
      </Box>
    </>
  );
};

export default ProxyConfigs;
