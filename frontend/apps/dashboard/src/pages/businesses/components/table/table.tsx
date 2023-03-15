import { useTranslation } from '@onefootprint/hooks';
import { Table as UITable } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';

import { Business } from '../../businesses.types';
import useFilters from '../../hooks/use-filters';
import Filters from './components/filters';
import Row from './components/row';

type TableProps = {
  businesses?: Business[];
  errorMessage?: string;
  isLoading: boolean;
};

const renderTr = ({ item: business }: { item: Business }) => (
  <Row business={business} />
);

const Table = ({ isLoading, errorMessage, businesses }: TableProps) => {
  const router = useRouter();
  const filters = useFilters();
  const { t } = useTranslation('pages.businesses');
  const columns = [
    { text: t('table.header.name'), width: '20%' },
    { text: t('table.header.token'), width: '20%' },
    { text: t('table.header.status'), width: '17.5%' },
    { text: t('table.header.submitted-by'), width: '25%' },
    { text: t('table.header.start'), width: '17.5%' },
  ];

  const handleRowClick = (business: Business) => {
    router.push({ pathname: `/businesses/${business.id}` });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ businesses_search: search });
  };

  return router.isReady ? (
    <UITable<Business>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={(business: Business) => business.id}
      initialSearch={filters.query.businesses_search}
      isLoading={isLoading}
      items={businesses}
      onChangeSearchText={handleSearchChange}
      onRowClick={handleRowClick}
      renderActions={() => <Filters />}
      renderTr={renderTr}
    />
  ) : null;
};

export default Table;
