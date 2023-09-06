import type { Entity } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';
import React from 'react';
import { useEntitiesContext } from 'src/components/entities/components/list/hooks/use-entities-context';

import ManualReviewFilters from '../manual-review-filters';

export type ManualReviewTableProps = {
  'aria-label': string;
  columns: { width: string; text: string }[];
  emptyStateText: string;
  renderTr: (entity: Entity) => JSX.Element;
};

const ManualReviewTable = ({
  'aria-label': ariaLabel,
  columns,
  emptyStateText,
  renderTr,
}: ManualReviewTableProps) => {
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
      renderActions={() => <ManualReviewFilters />}
      renderTr={({ item }) => renderTr(item)}
    />
  );
};

export default ManualReviewTable;
