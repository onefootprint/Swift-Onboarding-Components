import { FootprintFormType } from '@onefootprint/footprint-js';
import { CardDIField } from '@onefootprint/types';

import getCardDIField from './get-card-di-field';

const FieldsByVariant: Record<FootprintFormType, CardDIField[]> = {
  [FootprintFormType.cardOnly]: [
    CardDIField.number,
    CardDIField.expiration,
    CardDIField.cvc,
  ],
  [FootprintFormType.cardAndName]: [
    CardDIField.name,
    CardDIField.number,
    CardDIField.expiration,
    CardDIField.cvc,
  ],
  [FootprintFormType.cardAndNameAndAddress]: [
    CardDIField.name,
    CardDIField.number,
    CardDIField.expiration,
    CardDIField.cvc,
    CardDIField.zip,
    CardDIField.country,
  ],
  [FootprintFormType.cardAndZip]: [
    CardDIField.number,
    CardDIField.expiration,
    CardDIField.cvc,
    CardDIField.zip,
    CardDIField.country,
  ],
};

const validateClientTokenFields = (
  type: FootprintFormType,
  vaultFields?: string[],
) => {
  if (!vaultFields?.length) {
    console.error(
      "The auth token doesn't have permissions to collect any fields.",
    );
    return false;
  }

  const collectedFields = FieldsByVariant[type];
  const vaultFieldNames = vaultFields.map(field => getCardDIField(field));
  const hasPermissions = collectedFields.every(
    field => field && vaultFieldNames.includes(field),
  );

  if (!hasPermissions) {
    console.error(
      `The auth token does not have permissions to access the required fields for ${type} secure form, allowed fields: ${vaultFields.join(
        ', ',
      )}.`,
    );
  }
  return hasPermissions;
};

export default validateClientTokenFields;
