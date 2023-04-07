import { IdDocDI } from '@onefootprint/types';
import get from 'lodash/get';

import { FormData } from '../../../../vault.types';
import type { IdDocumentField } from '../../types';

export const getIdDocumentFields = (fields: FormData) => {
  const result: IdDocumentField[] = [];

  Object.values(IdDocDI).forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });

  return result;
};

export default getIdDocumentFields;
