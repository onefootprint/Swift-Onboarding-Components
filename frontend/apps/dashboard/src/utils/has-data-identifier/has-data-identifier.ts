import type { DataIdentifier, Entity } from '@onefootprint/types';

const hasDataIdentifier = (entity?: Entity, dataIdentifier?: DataIdentifier): boolean => {
  if (!entity || !dataIdentifier) {
    return false;
  }
  return entity.data.some(attribute => attribute.identifier === dataIdentifier);
};

export default hasDataIdentifier;
