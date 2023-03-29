import { Entity, EntityVault } from '@onefootprint/types';
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';

const getVaultOrCreate = async (queryClient: QueryClient, entity: Entity) => {
  const getFromCache = () =>
    queryClient.getQueryData<EntityVault>(['entity', entity.id, 'vault']);

  const createInitialData = () => {
    const vault: EntityVault = {};
    entity.attributes.forEach(attribute => {
      vault[attribute] = null;
    });
    return vault;
  };

  const possibleData = await getFromCache();
  return possibleData || createInitialData();
};

const useEntityVault = (entityId: string, entity?: Entity) => {
  const queryClient = useQueryClient();

  const update = (newData: EntityVault) => {
    const prevData = queryClient.getQueryData<EntityVault>([
      'entity',
      entityId,
      'vault',
    ]);
    queryClient.setQueryData(['entity', entityId, 'vault'], {
      ...prevData,
      ...newData,
    });
  };

  const query = useQuery<EntityVault>(
    ['entity', entityId, 'vault'],
    () => getVaultOrCreate(queryClient, entity as Entity),
    { enabled: !!entity },
  );

  return [query.data || {}, update] as const;
};

export default useEntityVault;
