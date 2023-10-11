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
  const collectedFields = FieldsByVariant[type];
  const vaultFieldNames =
    vaultFields?.map(field => getCardDIField(field)) || [];
  const hasPermissions = collectedFields.every(
    field => field && vaultFieldNames.includes(field),
  );

  return hasPermissions;
};

export default validateClientTokenFields;
