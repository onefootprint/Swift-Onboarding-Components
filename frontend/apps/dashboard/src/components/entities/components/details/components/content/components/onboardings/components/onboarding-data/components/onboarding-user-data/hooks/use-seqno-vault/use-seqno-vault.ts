import type { DataIdentifier, EntityAttribute } from '@onefootprint/request-types/dashboard';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type VaultType = {
  vault: Partial<Record<DataIdentifier, unknown>>;
  transforms: Partial<Record<DataIdentifier, unknown>>;
};

const getQueryKey = (seqno?: string) => ['vault', 'seqno', seqno];

// This is a custom hook that returns the vault for an entity at a given historical seqno.
const getVaultOrCreate = async (
  queryClient: QueryClient,
  entityAttributes: EntityAttribute[] | undefined,
  seqno?: string,
) => {
  const getFromCache = () => queryClient.getQueryData<VaultType>(getQueryKey(seqno));

  const createInitialData = (): VaultType => {
    const vaultAndTransforms: VaultType = {
      vault: {},
      transforms: {},
    };
    entityAttributes?.forEach(attribute => {
      vaultAndTransforms.vault[attribute.identifier] = attribute.value;
      vaultAndTransforms.transforms[attribute.identifier] = attribute.transforms;
    });
    return vaultAndTransforms;
  };

  const possibleData = await getFromCache();
  return possibleData || createInitialData();
};

const useSeqnoVault = (entityAttributes: EntityAttribute[] | undefined, seqno?: string) => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(seqno);

  const update = (newData: VaultType) => {
    const prevData = queryClient.getQueryData<VaultType>(queryKey);

    const newDataConverted = {} as Partial<Record<DataIdentifier, unknown>>;
    Object.keys(newData.vault).forEach((di: string) => {
      const newVal = newData.vault[di as DataIdentifier];

      // BE uses null for empty edited data, but FE uses it for encrypted data
      // So we convert null to undefined, which FE uses to designate empty data
      newDataConverted[di as DataIdentifier] = newVal === null ? undefined : newVal;

      // BE automatically updates ssn4 if ssn9 is edited, reflect that on the FE
      if (di === 'id.ssn9' && newVal) {
        newDataConverted['id.ssn4'] = (newVal as string).slice(-4);
      }
    });

    const newVault = { ...prevData?.vault, ...newDataConverted };
    const newTransforms = { ...prevData?.transforms, ...newData.transforms };
    queryClient.setQueryData(queryKey, {
      vault: newVault,
      transforms: newTransforms,
    });
  };

  const isAllDecrypted = (data: VaultType | undefined) => {
    if (!entityAttributes || !data) return false;
    return Object.values(data.vault).every(value => value !== null && value !== undefined);
  };

  const query = useQuery<VaultType>({
    queryKey,
    queryFn: () => getVaultOrCreate(queryClient, entityAttributes, seqno),
    enabled: !!entityAttributes,
  });

  return { data: query.data, update, isAllDecrypted: isAllDecrypted(query.data) };
};

export default useSeqnoVault;
