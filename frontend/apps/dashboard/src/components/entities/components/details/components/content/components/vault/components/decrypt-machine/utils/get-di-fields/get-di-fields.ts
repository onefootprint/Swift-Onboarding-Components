import { DataIdentifier, DataIdentifierKeys } from '@onefootprint/types';
import get from 'lodash/get';

const getDiFields = (
  fields: Partial<Record<DataIdentifier, boolean | null | undefined>>,
) => {
  const result: DataIdentifier[] = [];
  DataIdentifierKeys.forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value);
    }
  });

  return result;
};

export default getDiFields;
