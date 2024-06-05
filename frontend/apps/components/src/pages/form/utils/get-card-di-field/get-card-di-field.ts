import { getLogger } from '@onefootprint/idv';
import type { CardDIField } from '@onefootprint/types';

const { logError } = getLogger({ location: 'get-card-di-field' });

const getCardDIField = (di: string): CardDIField | null => {
  try {
    const [, , ...field] = di.split('.');
    return field.join('.') as CardDIField;
  } catch (e) {
    logError(`Error while parsing card DI field: ${e}`, e);
    return null;
  }
};

export default getCardDIField;
