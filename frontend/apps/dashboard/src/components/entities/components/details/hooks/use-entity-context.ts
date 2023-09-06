import type { EntityKind } from '@onefootprint/types';
import constate from 'constate';

type UseEntityContext = {
  kind: EntityKind;
  listPath: string;
};

const useEntity = (options: UseEntityContext) => options;

const [Provider, useEntityContext] = constate(useEntity);

export default Provider;
export { useEntityContext };
