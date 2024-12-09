import type { DataIdentifier as NewDataIdentifier, Entity as NewEntity } from '@onefootprint/request-types/dashboard';
import type { DataIdentifier, Entity } from '@onefootprint/types';

const isDiDecryptable = (entity?: Entity | NewEntity, dataIdentifier?: DataIdentifier | NewDataIdentifier): boolean => {
  if (!entity || !dataIdentifier) {
    return false;
  }
  return entity.data.some(attribute => attribute.identifier === dataIdentifier && attribute.isDecryptable);
};

export default isDiDecryptable;
