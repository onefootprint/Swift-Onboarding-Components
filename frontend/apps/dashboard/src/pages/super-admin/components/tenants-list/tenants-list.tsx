import styled from '@onefootprint/styled';
import type { Tenant } from '@onefootprint/types';
import { Pagination, Stack, Table, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import useSession from 'src/hooks/use-session';

import Row from './components/row';
import useFilters from './hooks/use-filters';
import useTenants from './hooks/use-tenants';

const TenantsList = () => {
  const { t } = useTranslation('super-admin');
  const filters = useFilters();
  const { data: response, isLoading, errorMessage, pagination } = useTenants();
  const columns = [
    { text: t('table.header.name'), width: '20%' },
    { text: t('table.header.id'), width: '25%' },
    { text: t('table.header.live-users'), width: '12.5%' },
    { text: t('table.header.sandbox-users'), width: '12.5%' },
    { text: t('table.header.created-at'), width: '15%' },
  ];
  const searchPlaceholder = t('table.search-placeholder') || '';
  const emptyState = errorMessage || t('table.empty-state') || '';

  const handleSearchChange = (search: string) => {
    filters.push({ tenants_search: search });
  };

  const useAssumeTenantMutation = useAssumeTenant();
  const { refreshUserPermissions } = useSession();
  const router = useRouter();

  const handleAssumeTenant = (tenant: Tenant) => {
    useAssumeTenantMutation.mutate(
      { tenantId: tenant.id },
      {
        onSuccess: async () => {
          await refreshUserPermissions();
          router.push('/users');
        },
      },
    );
  };

  return (
    <Container>
      <Stack gap={2} marginBottom={7} direction="column">
        <Typography variant="heading-2">{t('title')}</Typography>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Stack>
      <Table<Tenant>
        aria-label={t('table.aria-label')}
        columns={columns}
        emptyStateText={emptyState}
        getKeyForRow={(tenant: Tenant) => tenant.id}
        initialSearch=""
        isLoading={isLoading}
        items={response?.data}
        onChangeSearchText={handleSearchChange}
        renderTr={tenant => <Row tenant={tenant.item} />}
        onRowClick={handleAssumeTenant}
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
  );
};

const Container = styled.div`
  max-width: 1600px;
  margin-right: auto;
  margin-left: auto;
`;

export default TenantsList;
