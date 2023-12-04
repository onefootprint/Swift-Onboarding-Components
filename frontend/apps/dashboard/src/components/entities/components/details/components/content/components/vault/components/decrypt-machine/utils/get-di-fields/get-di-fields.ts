import { type DataIdentifier } from '@onefootprint/types';
import flat from 'flat';
import get from 'lodash/get';

const getDiFields = (
  fields: Partial<Record<DataIdentifier, boolean | null | undefined>>,
) => {
  const result: DataIdentifier[] = [];
  const flatFieldsArray = Object.keys(flat(fields));
  flatFieldsArray.forEach(value => {
    const checked = get(fields, value);
    if (checked) {
      result.push(value as DataIdentifier);
    }
  });

  return result;
};

export default getDiFields;
