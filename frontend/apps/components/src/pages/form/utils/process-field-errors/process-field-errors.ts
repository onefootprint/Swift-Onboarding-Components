import { getLogger } from '@onefootprint/idv';
import type { DataIdentifier } from '@onefootprint/types';
import { CardDIField } from '@onefootprint/types';

import type { PartialAddressData } from '../../components/form-base/components/address';
import type { CardData } from '../../components/form-base/components/card';
import type { NameData } from '../../components/form-base/components/name';
import getCardDiField from '../get-card-di-field';

type FormKeys = keyof NameData | keyof CardData | keyof PartialAddressData;

const { logError } = getLogger({ location: 'process-field-errors' });

export const FormFieldByDI: Partial<Record<CardDIField, FormKeys>> = {
  [CardDIField.name]: 'name',
  [CardDIField.number]: 'number',
  [CardDIField.cvc]: 'cvc',
  [CardDIField.expiration]: 'expiry',
  [CardDIField.zip]: 'zip',
  [CardDIField.country]: 'country',
};

const processFieldErrors = (error: Object): Partial<Record<FormKeys, string>> | undefined => {
  if (typeof error !== 'object') {
    logError('Unexpected error while vaulting field', error);
    return undefined;
  }

  const validatedErrors: Partial<Record<FormKeys, string>> = {};
  Object.entries(error).forEach(([key, value]) => {
    const cardDI = getCardDiField(key as DataIdentifier);
    const field = cardDI ? FormFieldByDI[cardDI] : undefined;
    if (field && cardDI) {
      validatedErrors[field] = value;
    } else {
      logError(`Could not parse error while vaulting field ${key}:${value}`, error);
    }
  });

  return validatedErrors;
};

export default processFieldErrors;
