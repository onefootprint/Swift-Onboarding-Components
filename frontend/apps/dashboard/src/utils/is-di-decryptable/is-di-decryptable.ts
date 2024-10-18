import type { DataIdentifier, Entity } from '@onefootprint/types';

const isDiDecryptable = (entity?: Entity, dataIdentifier?: DataIdentifier): boolean => {
  if (!entity || !dataIdentifier) {
    return false;
  }
  return entity.data.some(attribute => attribute.isDecryptable && attribute.identifier === dataIdentifier);
};

export default isDiDecryptable;
