import { Box, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import Create from './components/create';
import Details from './components/details';
import Table from './components/table';
import useProxyConfigs from './hooks/use-proxy-configs';

const ProxyConfigs = () => {
  const { t } = useTranslation('proxy-configs');
  const { data, errorMessage, isPending } = useProxyConfigs();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Stack align="center" direction="row" justify="space-between" marginBottom={7}>
        <Stack align="left" direction="column" gap={2}>
          <Text variant="heading-2">{t('header.title')}</Text>
          <Text variant="body-2" color="secondary">
            {t('header.subtitle')}
          </Text>
        </Stack>
        <Create />
      </Stack>
      <Box testID="proxy-configs-section" tag="section">
        <Table data={data} errorMessage={errorMessage} isPending={isPending} />
        <Details />
      </Box>
    </>
  );
};

export default ProxyConfigs;
