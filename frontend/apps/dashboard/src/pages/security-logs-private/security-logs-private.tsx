import type { AccessEvent } from '@onefootprint/types';
import { Divider, SearchInput, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useGetAccessEvents from 'src/hooks/use-get-access-events';
import SecurityLogsFilters from './components/security-logs-filters';
import Timeline from './components/timeline';

const SecurityLogsPrivate = () => {
  const { t } = useTranslation('security-logs');

  const getAccessEvents = useGetAccessEvents();
  const accessEvents: AccessEvent[] =
    getAccessEvents.data?.pages.reduce<AccessEvent[]>((allPages, page) => [...allPages, ...(page?.data ?? [])], []) ??
    [];

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={5}>
        {t('header.title')}
      </Text>
      <Stack gap={5} direction="column">
        <SearchInput
          width="232px"
          onChangeText={() => console.log('test change text')}
          value=""
          size="compact"
          placeholder={t('filters.search')}
        />
        <SecurityLogsFilters />
        <Divider />
        <Timeline accessEvents={accessEvents} isLoading={getAccessEvents.isLoading} />
      </Stack>
    </>
  );
};

export default SecurityLogsPrivate;
