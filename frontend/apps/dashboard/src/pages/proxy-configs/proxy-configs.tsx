import { Box, Stack, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Create from './components/create';
import Details from './components/details';
import Table from './components/table';
import useProxyConfigs from './hooks/use-proxy-configs';

const ProxyConfigs = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.proxy-configs' });
  const { data, errorMessage, isLoading } = useProxyConfigs();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Stack
        align="center"
        direction="row"
        justify="space-between"
        marginBottom={7}
      >
        <Stack direction="column" gap={2}>
          <Typography variant="heading-2">{t('header.title')}</Typography>
          <Typography variant="body-2" color="secondary">
            {t('header.subtitle')}
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
