import isPlainObject from 'lodash/isPlainObject';
import type { FormValues } from '../../types';

type FlattenObjectOptions = {
  level?: number;
  parentKey?: string;
  sep?: string;
};

const flattenObject = (
  obj: Record<string, unknown>,
  { level = Infinity, parentKey = '', sep = '.' }: FlattenObjectOptions = {},
): Record<string, unknown> => {
  const toReturn: Record<string, unknown> = {};

  if (level < 0) {
    toReturn[parentKey] = obj;
    return toReturn;
  }

  Object.keys(obj).forEach(key => {
    const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
    if (isPlainObject(obj[key])) {
      const flatObject = flattenObject(obj[key] as Record<string, unknown>, {
        level: level - 1,
        parentKey: newKey,
        sep,
      });
      Object.keys(flatObject).forEach(x => {
        toReturn[x] = flatObject[x] as FormValues;
      });
    } else {
      toReturn[newKey] = obj[key] as FormValues;
    }
  });

  return toReturn;
};

export default flattenObject;
