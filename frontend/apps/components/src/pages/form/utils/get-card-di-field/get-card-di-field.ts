import { Logger } from '@onefootprint/idv-elements';
import type { CardDIField } from '@onefootprint/types';

const getCardDIField = (di: string): CardDIField | null => {
  try {
    const [, , ...field] = di.split('.');
    return field.join('.') as CardDIField;
  } catch (e) {
    Logger.error(`Error while parsing card DI field: ${e}`);
    return null;
  }
};

export default getCardDIField;
