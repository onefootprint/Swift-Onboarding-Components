import { getOrgMetricsOptions } from '@onefootprint/axios/dashboard';
import { Box, Stack, Text } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

import Content from './components/content';
import DateFilter from './components/date-filter';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import PlaybooksFilter from './components/playbooks-filter';
import useFilters from './hooks/use-filters';

const Home = () => {
  const { t } = useTranslation('home');
  const filters = useFilters();
  const metricsQuery = useQuery(
    getOrgMetricsOptions({
      query: filters.requestParams,
    }),
  );

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={7}>
        {t('header.title')}
      </Text>
      <Box aria-busy={metricsQuery.isPending}>
        <Stack
          alignItems="center"
          borderBottomWidth={1}
          borderColor="tertiary"
          borderStyle="solid"
          justifyContent="space-between"
          marginBottom={4}
          paddingBottom={4}
        >
          <Text variant="heading-5" tag="h1">
            {t('onboarding-metrics.title')}
          </Text>
          <Stack gap={4}>
            <DateFilter />
            <PlaybooksFilter />
          </Stack>
        </Stack>
        {metricsQuery.isPending ? <Loading /> : null}
        {metricsQuery.error ? <ErrorComponent error={metricsQuery.error} /> : null}
        {metricsQuery.data ? <Content metrics={metricsQuery.data} /> : null}
      </Box>
    </>
  );
};

export default Home;
