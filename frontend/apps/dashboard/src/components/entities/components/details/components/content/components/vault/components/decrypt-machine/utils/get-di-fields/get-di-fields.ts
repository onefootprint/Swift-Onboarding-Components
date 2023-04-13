import { DataIdentifierKeys } from '@onefootprint/types';
import get from 'lodash/get';

import { FormData } from '../../../../vault.types';
import { DiField } from '../../types';

const getDiFields = (fields: FormData) => {
  const result: DiField[] = [];
  DataIdentifierKeys.forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });
  return result;
};

export default getDiFields;
