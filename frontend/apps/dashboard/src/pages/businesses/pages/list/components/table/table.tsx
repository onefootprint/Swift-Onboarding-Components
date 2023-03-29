import { useTranslation } from '@onefootprint/hooks';
import type { Entity } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';

import useFilters from '../../hooks/use-filters';
import Filters from '../filters';
import Row from '../row';

type TableProps = {
  entities?: Entity[];
  errorMessage?: string;
  isLoading: boolean;
};

const renderTr = ({ item }: { item: Entity }) => <Row entity={item} />;

const Table = ({ isLoading, errorMessage, entities }: TableProps) => {
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

  const handleRowClick = (entity: Entity) => {
    router.push({ pathname: `/businesses/${entity.id}` });
  };

  const handleSearchChange = (search: string) => {
    filters.push({ search });
  };

  return router.isReady ? (
    <UITable<Entity>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('table.empty-state')}
      getKeyForRow={(entity: Entity) => entity.id}
      initialSearch={filters.query.search}
      isLoading={isLoading}
      items={entities}
      onChangeSearchText={handleSearchChange}
      onRowClick={handleRowClick}
      renderActions={() => <Filters />}
      renderTr={renderTr}
    />
  ) : null;
};

export default Table;
