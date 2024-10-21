import type { Entity } from '@onefootprint/types';

const hasSomeDiDecryptable = (entity?: Entity): boolean => {
  if (!entity) {
    return false;
  }
  return entity.data.some(attribute => attribute.isDecryptable);
};

export default hasSomeDiDecryptable;
