import { Entity } from '@onefootprint/types';
import constate from 'constate';

type UserListData = {
  data?: Entity[];
  errorMessage?: string;
  initialSearch?: string;
  isLoading: boolean;
  onRowClick: (entity: Entity) => void;
  onSearchChange: (search: string) => void;
};

const useListData = (options: UserListData) => options;

const [Provider, useList] = constate(useListData);

export default Provider;
export { useList };
