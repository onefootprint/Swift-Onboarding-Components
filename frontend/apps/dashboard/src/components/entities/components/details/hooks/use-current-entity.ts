import useEntityVault, { type VaultType } from '@/entities/hooks/use-entity-vault';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { Attribute, Entity } from '@onefootprint/types/src/data/entity';
import useEntity from './use-entity';
import useEntityId from './use-entity-id';
import useEntitySeqno from './use-entity-seqno';
import useHistoricalEntityData from './use-historical-entity-data';

const useCurrentEntity = () => {
  const id = useEntityId();
  const seqno = useEntitySeqno();
  const entityQuery = useEntity(id);

  // TODO: fix the types
  const { updateForHistorical } = useEntityVault(id, entityQuery.data as Entity);
  const showRequestErrorToast = useRequestErrorToast();
  useHistoricalEntityData(id, seqno, {
    onSuccess: (historicalData: Attribute[]) => {
      // Update cached vault to contain historical data
      const vaultAndTransforms: VaultType = {
        vault: {},
        transforms: {},
        dataKinds: {},
      };
      historicalData.forEach(attribute => {
        vaultAndTransforms.vault[attribute.identifier] = attribute.value;
        vaultAndTransforms.transforms[attribute.identifier] = attribute.transforms;
        vaultAndTransforms.dataKinds[attribute.identifier] = attribute.dataKind;
      });
      updateForHistorical(vaultAndTransforms);
    },
    onError: (error: unknown) => showRequestErrorToast(error),
  });

  return entityQuery;
};

export default useCurrentEntity;
