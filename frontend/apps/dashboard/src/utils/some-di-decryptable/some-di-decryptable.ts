import type { Entity } from '@onefootprint/types';

const someDiDecryptable = (entity?: Entity): boolean => {
  if (!entity) {
    return false;
  }
  return entity.data.some(attribute => attribute.isDecryptable);
};

export default someDiDecryptable;
