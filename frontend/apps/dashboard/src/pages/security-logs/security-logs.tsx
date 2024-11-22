import type { AuditEvent } from '@onefootprint/request-types/dashboard';
import { Divider, LoadingSpinner, SearchInput, Stack, Text, Toggle } from '@onefootprint/ui';
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
  const getAccessEvents = useGetAccessEvents();

  const filters = useSecurityLogsFilters();
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
    'decrypt_org_api_key',
    // 'create_org_api_key',
    // 'update_org_api_key_role',
    'update_user_data',
    'delete_user_data',
  ];

  const isFirmEmployee = session?.user?.isFirmEmployee;

  useEffect(() => {
    const checkIfShouldLoadMore = () => {
      const mainContainer = document.getElementById(MAIN_PAGE_ID);
      if (!mainContainer) return;

      const { scrollHeight, clientHeight } = mainContainer;
      const shouldLoadMore = scrollHeight <= clientHeight;

      if (shouldLoadMore && !getAccessEvents.isFetchingNextPage && getAccessEvents.hasNextPage) {
        getAccessEvents.fetchNextPage();
      }
    };

    const handleScroll = () => {
      const mainContainer = document.getElementById(MAIN_PAGE_ID);
      if (!mainContainer) return;

      const { scrollHeight, scrollTop, clientHeight } = mainContainer;
      const offset = clientHeight * 0.5;
      const reachedBottom = scrollHeight - scrollTop <= clientHeight + offset;

      if (reachedBottom && !getAccessEvents.isFetchingNextPage && getAccessEvents.hasNextPage) {
        getAccessEvents.fetchNextPage();
      }
    };

    checkIfShouldLoadMore();

    const mainContainer = document.getElementById(MAIN_PAGE_ID);
    mainContainer?.addEventListener('scroll', handleScroll);
    return () => mainContainer?.removeEventListener('scroll', handleScroll);
  }, [getAccessEvents, getAccessEvents.data]);

  const filteredAuditEvents = auditEvents.filter(auditEvent =>
    isFirmEmployee
      ? extendedAccessEventsToShow.includes(auditEvent.detail.kind)
      : accessEventsToShow.includes(auditEvent.detail.kind),
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
        {(getAccessEvents.isFetchingNextPage || getAccessEvents.isLoading) && (
          <Stack justifyContent="center" padding={4}>
            <LoadingSpinner />
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default SecurityLogs;
