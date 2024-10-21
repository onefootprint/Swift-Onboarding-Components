import type { DataIdentifier, Entity } from '@onefootprint/types';

const getDecryptableDIs = (entity?: Entity): DataIdentifier[] => {
  if (!entity) {
    return [];
  }
  return entity.data.filter(attribute => attribute.isDecryptable).map(attribute => attribute.identifier);
};

export default getDecryptableDIs;
