import type { AuditEvent } from '@onefootprint/request-types/dashboard';
import { Divider, SearchInput, Stack, Text, Toggle } from '@onefootprint/ui';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAIN_PAGE_ID } from 'src/config/constants';
import useGetAccessEvents from 'src/hooks/use-get-access-events';
import useSession from 'src/hooks/use-session';
import useSecurityLogsFilters from '../../hooks/use-security-logs-filters';
import SecurityLogsFilters from './components/security-logs-filters';
import Timeline from './components/timeline';

const SecurityLogs = () => {
  const { t } = useTranslation('security-logs');
  const [showDecryptionReason, setShowDecryptionReason] = useState(false);
  const { data: session } = useSession();

  const filters = useSecurityLogsFilters();
  const getAccessEvents = useGetAccessEvents();
  const auditEvents: AuditEvent[] =
    getAccessEvents.data?.pages.reduce<AuditEvent[]>((allPages, page) => [...allPages, ...(page?.data ?? [])], []) ??
    [];

  const accessEventsToShow = ['decrypt_user_data'];

  const extendedAccessEventsToShow = [
    ...accessEventsToShow,
    'create_org_role',
    'update_org_role',
    'deactivate_org_role',
    'invite_org_member',
    'update_org_member',
    'remote_org_member',
  ];

  const isFirmEmployee = session?.user?.isFirmEmployee;

  useEffect(() => {
    const handleScroll = () => {
      // Just before reaching the bottom of the page, start loading the next page of data
      const mainContainer = document.getElementById(MAIN_PAGE_ID);
      if (!mainContainer) return;
      const offset = mainContainer.clientHeight * 0.25;
      const reachedBottom = mainContainer.scrollHeight - mainContainer.scrollTop <= mainContainer.clientHeight + offset;
      if (reachedBottom) {
        if (!getAccessEvents.isFetchingNextPage && getAccessEvents.hasNextPage) {
          getAccessEvents.fetchNextPage();
        }
      }
    };

    const mainContainer = document.getElementById(MAIN_PAGE_ID);
    mainContainer?.addEventListener('scroll', handleScroll);
    return () => {
      mainContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [getAccessEvents.isFetchingNextPage, getAccessEvents.hasNextPage]);

  // NOTE: placeholder for now
  // include other events as we add UI support for them
  const filteredAuditEvents = auditEvents.filter(auditEvent =>
    isFirmEmployee
      ? extendedAccessEventsToShow.includes(auditEvent.name)
      : accessEventsToShow.includes(auditEvent.name),
  );

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Text variant="heading-2" marginBottom={5}>
        {t('header.title')}
      </Text>
      <Stack gap={5} direction="column">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" gap={4}>
            <SearchInput
              width="232px"
              onChangeText={value => filters.push({ search: value })}
              value={filters.query.search || ''}
              size="compact"
              placeholder={t('filters.search')}
            />
            <SecurityLogsFilters />
          </Stack>
          <Stack gap={0} alignItems="center">
            <Toggle
              checked={showDecryptionReason}
              onChange={() => setShowDecryptionReason(!showDecryptionReason)}
              size="compact"
            />
            <Text variant="label-3">{t('show-decryption-reason')}</Text>
          </Stack>
        </Stack>
        <Divider />
        <Timeline
          auditEvents={filteredAuditEvents}
          isLoading={getAccessEvents.isLoading}
          showDecryptionReason={showDecryptionReason}
        />
      </Stack>
    </>
  );
};

export default SecurityLogs;
