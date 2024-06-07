import { dateToIso8601 } from '@onefootprint/core';
import type { FootprintUserData } from '@onefootprint/footprint-js';
import isPlainObject from 'lodash/isPlainObject';

const flattenObject = (
  obj: Record<string, unknown>,
  parentKey: string = '',
  sep: string = '.',
): Record<string, string> => {
  const toReturn: Record<string, string> = {};

  Object.keys(obj).forEach(key => {
    const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
    if (isPlainObject(obj[key])) {
      const flatObject = flattenObject(obj[key] as Record<string, unknown>, newKey, sep);
      Object.keys(flatObject).forEach(x => {
        toReturn[x] = flatObject[x];
      });
    } else {
      toReturn[newKey] = String(obj[key]);
    }
  });

  return toReturn;
};

const getVaultData = (formData: FootprintUserData) => {
  const data = flattenObject(formData);
  delete data['id.phone_number'];
  delete data['id.email'];
  return {
    ...data,
    'id.dob': data['id.dob'] ? dateToIso8601(data['id.dob']) : undefined,
  };
};

export default getVaultData;
