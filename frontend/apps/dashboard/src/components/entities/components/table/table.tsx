import type { Entity } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import React from 'react';

import { useEntitiesContext } from '../list/hooks/use-entities-context';
import Filters from './components/filters';

export type TableProps = {
  'aria-label': string;
  columns: { width: string; text: string }[];
  emptyStateText: string;
  renderTr: (entity: Entity) => JSX.Element;
};

const Table = ({
  'aria-label': ariaLabel,
  columns,
  emptyStateText,
  renderTr,
}: TableProps) => {
  const context = useEntitiesContext();

  return (
    <UITable<Entity>
      aria-label={ariaLabel}
      columns={columns}
      emptyStateText={context.errorMessage || emptyStateText}
      getKeyForRow={(entity: Entity) => entity.id}
      initialSearch={context.initialSearch}
      isLoading={context.isLoading}
      items={context.data}
      onChangeSearchText={context.onSearchChange}
      onRowClick={context.onRowClick}
      renderActions={() => <Filters />}
      renderTr={({ item }) => renderTr(item)}
    />
  );
};

export default Table;
