import type { List } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useFilters from '../../hooks/use-filters';
import Row from './components/row';

type TableProps = {
  data?: List[];
  errorMessage?: string;
  isLoading?: boolean;
};

const Table = ({ data, isLoading, errorMessage }: TableProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.lists' });
  const filters = useFilters();
  const columns = [
    { id: 'name', text: t('table.header.name'), width: '20%' },
    { id: 'alias', text: t('table.header.alias'), width: '20%' },
    { id: 'entries', text: t('table.header.entries'), width: '20%' },
    {
      id: 'used',
      text: t('table.header.used-in-rules'),
      width: '20%',
    },
    { id: 'created', text: t('table.header.created'), width: '20%' },
  ];

  const handleRowClick = (list: List) => {
    filters.push({ id: list.id });
  };

  return (
    <UITable<List>
      aria-label={t('table.aria-label')}
      columns={columns}
      emptyStateText={errorMessage || t('empty-description')}
      getAriaLabelForRow={list => list.name}
      getKeyForRow={list => list.id}
      isLoading={isLoading}
      items={data}
      onRowClick={handleRowClick}
      renderTr={({ item: list }) => <Row list={list} />}
    />
  );
};

export default Table;
