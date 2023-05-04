import { DataIdentifier } from '@onefootprint/types';

const getFilterValueForDI = (di: DataIdentifier) => {
  const fields = di.split('.');
  if (fields.length === 1) {
    return di;
  }
  return fields[1];
};

export default getFilterValueForDI;
