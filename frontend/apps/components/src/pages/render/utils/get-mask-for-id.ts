import { CardDIField, DataIdentifier } from '@onefootprint/types';

import { RenderMask } from '../components/render-base';
import { isCardDI } from './is-valid-di';

const maskByCardDIField: Partial<Record<CardDIField, RenderMask>> = {
  [CardDIField.number]: 'creditCard',
  [CardDIField.cvc]: 'cvc',
  [CardDIField.expiration]: 'date',
  [CardDIField.expirationMonth]: 'date',
  [CardDIField.expirationYear]: 'date',
};

const getCardDIField = (id: DataIdentifier): CardDIField | null => {
  try {
    const [, , ...field] = id.split('.');
    return field.join('.') as CardDIField;
  } catch (e) {
    return null;
  }
};

const getMaskForId = (id: string): RenderMask | undefined => {
  if (!isCardDI(id)) {
    return undefined;
  }
  const field = getCardDIField(id);
  if (!field) {
    return undefined;
  }
  return maskByCardDIField[field];
};

export default getMaskForId;
