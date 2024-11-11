import type { Entity, EntityKind } from '@onefootprint/types';
import constate from 'constate';

type UseEntitiesContext = {
  kind: EntityKind;
  data?: Entity[];
  errorMessage?: string;
  initialSearch?: string;
  isPending: boolean;
  onRowClick: (entity: Entity, event: React.MouseEvent<HTMLTableRowElement>) => void;
  onSearchChange: (search: string) => void;
};

const useLocalEntitiesContext = (options: UseEntitiesContext) => options;

const [Provider, useEntitiesContext] = constate(useLocalEntitiesContext);

export default Provider;
export { useEntitiesContext };
