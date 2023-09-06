import type { Entity, EntityVault } from '@onefootprint/types';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// This is a custom hook that returns the vault for an entity.
// The vault is stored in the query cache, so can persist and access from anywhere (e.g list page)
// The main reason for keeping it separated is is because we should not overwrite it once we make an entity request,
// any only when we decrypt some data we should update it.
const getVaultOrCreate = async (queryClient: QueryClient, entity: Entity) => {
  const getFromCache = () =>
    queryClient.getQueryData<EntityVault>(['entity', entity.id, 'vault']);

  const createInitialData = () => {
    const vault: EntityVault = {};
    entity.attributes.forEach(attribute => {
      vault[attribute] = entity.decryptedAttributes[attribute] ?? null;
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

  return { ...query, update };
};

export default useEntityVault;
