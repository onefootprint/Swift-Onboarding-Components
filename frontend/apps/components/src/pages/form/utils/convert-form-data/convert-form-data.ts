import type { DataIdentifier } from '@onefootprint/types';
import { CardDIField } from '@onefootprint/types';

import type { FormData } from '../../components/form-base';

const convertFormData = (formData: FormData, cardAlias: string): Partial<Record<DataIdentifier, string>> => {
  // For now, we don't support saving address data
  const values: Record<string, string> = {
    [CardDIField.number]: formData.number.split(' ').join(''),
    [CardDIField.expiration]: formData.expiry,
    [CardDIField.cvc]: formData.cvc,
  };
  if ('name' in formData) {
    values[CardDIField.name] = formData.name;
  }
  if ('zip' in formData) {
    values[CardDIField.zip] = formData.zip;
  }
  if ('country' in formData) {
    values[CardDIField.country] = formData.country.value;
  }
  const valueMap = Object.entries(values).map(([key, value]) => [`card.${cardAlias}.${key}`, value]);
  const data = Object.fromEntries(valueMap);
  return data;
};

export default convertFormData;
