import {
  type DataIdentifier,
  type Entity,
  type EntityVault,
  IdDI,
  type VaultValue,
} from '@onefootprint/types';
import type { Transforms } from '@onefootprint/types/src/data/entity';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type VaultType = {
  vault: EntityVault;
  transforms: Partial<Record<DataIdentifier, Transforms>>;
};

// This is a custom hook that returns the vault for an entity.
// The vault is stored in the query cache, so can persist and access from anywhere (e.g list page)
// The main reason for keeping it separated is is because we should not overwrite it once we make an entity request,
// any only when we decrypt some data we should update it.
const getVaultOrCreate = async (queryClient: QueryClient, entity: Entity) => {
  const getFromCache = () =>
    queryClient.getQueryData<VaultType>(['entity', entity.id, 'vault']);

  const createInitialData = (): VaultType => {
    const vaultsAndTransforms: VaultType = { vault: {}, transforms: {} };
    entity.data.forEach(attribute => {
      vaultsAndTransforms.vault[attribute.identifier] = attribute.value;
      vaultsAndTransforms.transforms[attribute.identifier] =
        attribute.transforms;
    });
    return vaultsAndTransforms;
  };

  const possibleData = await getFromCache();
  return possibleData || createInitialData();
};

const useEntityVaultWithTransforms = (entityId: string, entity?: Entity) => {
  const queryClient = useQueryClient();

  const update = (newData: VaultType) => {
    const prevData = queryClient.getQueryData<VaultType>([
      'entity',
      entityId,
      'vault',
    ]);

    const newDataConverted = {} as Partial<Record<DataIdentifier, VaultValue>>;
    Object.keys(newData.vault).forEach((di: string) => {
      const newVal = newData.vault[di as DataIdentifier];

      // BE uses null for empty data, but FE uses it for encrypted data
      // So we convert null to undefined, which FE uses to designate empty data
      newDataConverted[di as DataIdentifier] =
        newVal === null ? undefined : newVal;

      // BE automatically updates ssn4 if ssn9 is edited, reflect that on the FE
      if (di === IdDI.ssn9 && newVal) {
        newDataConverted[IdDI.ssn4] = (newVal as string).slice(-4);
      }
    });

    const newVault = { ...prevData?.vault, ...newDataConverted };
    const newTransforms = { ...prevData?.transforms, ...newData.transforms };
    queryClient.setQueryData(['entity', entityId, 'vault'], {
      vault: newVault,
      transforms: newTransforms,
    });
  };

  const query = useQuery<VaultType>(
    ['entity', entityId, 'vault'],
    () => getVaultOrCreate(queryClient, entity as Entity),
    { enabled: !!entity },
  );

  return { ...query, update };
};

export default useEntityVaultWithTransforms;
