import type { Entity } from '@onefootprint/types';
import { Table as UITable } from '@onefootprint/ui';

import { useEntitiesContext } from '../list/hooks/use-entities-context';
import Filters from './components/filters';

export type TableProps = {
  'aria-label': string;
  columns: { width: string; text: string }[];
  emptyStateText: string;
  renderTr: (entity: Entity) => JSX.Element;
  searchPlaceholder: string;
};

const Table = ({ 'aria-label': ariaLabel, columns, emptyStateText, searchPlaceholder, renderTr }: TableProps) => {
  const context = useEntitiesContext();

  return (
    <UITable<Entity>
      aria-label={ariaLabel}
      columns={columns}
      emptyStateText={context.errorMessage || emptyStateText}
      getKeyForRow={(entity: Entity) => entity.id}
      initialSearch={context.initialSearch}
      isLoading={context.isPending}
      items={context.data}
      onChangeSearchText={context.onSearchChange}
      onRowClick={context.onRowClick}
      renderSubActions={() => <Filters />}
      renderTr={({ item }) => renderTr(item)}
      searchPlaceholder={searchPlaceholder}
    />
  );
};

export default Table;
