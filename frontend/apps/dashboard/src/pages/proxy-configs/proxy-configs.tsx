import { useTranslation } from '@onefootprint/hooks';
import { Box, Stack, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

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
      <Stack
        direction="row"
        justify="space-between"
        align="center"
        marginBottom={7}
      >
        <Stack direction="column" gap={2}>
          <Typography variant="heading-2">{t('section-title')}</Typography>
          <Typography variant="body-2" color="secondary">
            {t('subtitle')}
          </Typography>
        </Stack>
        <Create />
      </Stack>
      <Box testID="proxy-configs-section" as="section">
        <Table data={data} errorMessage={errorMessage} isLoading={isLoading} />
        <Details />
      </Box>
    </>
  );
};

export default ProxyConfigs;
