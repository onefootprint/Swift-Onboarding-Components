import { type AccessEvent, AccessEventKind } from '@onefootprint/types';
import { Divider, SearchInput, Stack, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import useGetAccessEvents from 'src/hooks/use-get-access-events';
import SecurityLogsFilters from './components/security-logs-filters';
import Timeline from './components/timeline';

const SecurityLogs = () => {
  const { t } = useTranslation('security-logs');

  const getAccessEvents = useGetAccessEvents();
  const accessEvents: AccessEvent[] =
    getAccessEvents.data?.pages.reduce<AccessEvent[]>((allPages, page) => [...allPages, ...(page?.data ?? [])], []) ??
    [];

  // NOTE: placeholder for now
  // include other events as we add UI support for them
  const filteredAccessEvents = accessEvents.filter(accessEvent => accessEvent.name === AccessEventKind.DecryptUserData);

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
        <Timeline accessEvents={filteredAccessEvents} isLoading={getAccessEvents.isLoading} />
      </Stack>
    </>
  );
};

export default SecurityLogs;
