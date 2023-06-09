import { Entity } from '@onefootprint/types';
import constate from 'constate';

type UseEntitiesContext = {
  data?: Entity[];
  errorMessage?: string;
  initialSearch?: string;
  isLoading: boolean;
  onRowClick: (entity: Entity) => void;
  onSearchChange: (search: string) => void;
};

const useLocalEntitiesContext = (options: UseEntitiesContext) => options;

const [Provider, useEntitiesContext] = constate(useLocalEntitiesContext);

export default Provider;
export { useEntitiesContext };
