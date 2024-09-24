import type { Tenant } from '@onefootprint/types';
import { Pagination, SegmentedControl, Stack, Table, Text } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import useSession from 'src/hooks/use-session';
import styled from 'styled-components';

import DetailDrawer from './components/detail-drawer';
import Row from './components/row';
import useFilters from './hooks/use-filters';
import useTenants from './hooks/use-tenants';

const Tenants = () => {
  const { t } = useTranslation('internal');
  const useAssumeTenantMutation = useAssumeTenant();
  const { logIn } = useSession();
  const router = useRouter();
  const filters = useFilters();
  const { data: response, isPending, errorMessage, pagination } = useTenants();
  const [drawerTenantId, setDrawerTenantId] = useState<string | undefined>(undefined);
  const columns = [
    { text: t('table.header.name'), width: '30%' },
    { text: t('table.header.id'), width: '25%' },
    { text: t('table.header.live-users'), width: '12.5%' },
    { text: t('table.header.sandbox-users'), width: '12.5%' },
    { text: t('table.header.created-at'), width: '15%' },
    { id: 'actions', text: '', width: '5%' },
  ];
  const searchPlaceholder = t('table.search-placeholder') || '';
  const emptyState = errorMessage || t('table.empty-state') || '';

  const handleSearchChange = (search: string) => {
    filters.push({ tenants_search: search, tenants_page: undefined });
  };
  const handleLiveOnlyChange = (value: string) => {
    filters.push({ tenants_live_only: value, tenants_page: undefined });
  };

  const handleAssumeTenant = (tenant: Tenant) => {
    useAssumeTenantMutation.mutate(
      { tenantId: tenant.id },
      {
        onSuccess: async ({ token }) => {
          await logIn({ auth: token });
          router.push('/users');
        },
      },
    );
  };

  const handleOpenDrawer = (tenant: Tenant) => {
    setDrawerTenantId(tenant.id);
  };
  const handleDrawerClose = () => {
    setDrawerTenantId(undefined);
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Container>
        <Stack direction="column" marginBottom={7}>
          <Stack gap={2} marginBottom={4} direction="column">
            <Text variant="heading-2">{t('title')}</Text>
            <Text variant="body-2" color="secondary">
              {t('subtitle')}
            </Text>
          </Stack>
          <SegmentedControl
            aria-label="Live Tenants"
            onChange={handleLiveOnlyChange}
            options={[
              {
                label: 'All',
                value: 'false',
              },
              {
                label: 'Live only',
                value: 'true',
              },
            ]}
            value={filters.values.liveOnly ? 'true' : 'false'}
          />
        </Stack>
        <Table<Tenant>
          aria-label={t('table.aria-label')}
          columns={columns}
          emptyStateText={emptyState}
          getKeyForRow={(tenant: Tenant) => tenant.id}
          initialSearch=""
          isLoading={isPending}
          items={response?.data}
          onChangeSearchText={handleSearchChange}
          renderTr={tenant => <Row tenant={tenant.item} onAssumeTenant={handleAssumeTenant} />}
          onRowClick={handleOpenDrawer}
          searchPlaceholder={searchPlaceholder}
        />
        {response && response.meta.count > 0 && (
          <Pagination
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onNextPage={pagination.loadNextPage}
            onPrevPage={pagination.loadPrevPage}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            totalNumResults={response.meta.count}
          />
        )}
      </Container>
      <DetailDrawer tenantId={drawerTenantId} onClose={handleDrawerClose} />
    </>
  );
};

const Container = styled.div`
  max-width: 1600px;
  margin-right: auto;
  margin-left: auto;
`;

export default Tenants;
