import type { IdDI } from '@onefootprint/types';
import isEqual from 'lodash/isEqual';

import type { KycData } from '../../../data-types';

interface Comparator {
  (a?: unknown, b?: unknown): boolean;
  (a?: unknown[], b?: unknown[]): boolean;
}

export const isEqArray: Comparator = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((x, idx) => x === sortedB[idx]);
};

const mergeInitialData = (initData: KycData, decryptedFields: KycData): KycData => {
  const newValues = Object.entries(decryptedFields).reduce<KycData>((obj, [k, val]) => {
    const initValue = initData?.[k as IdDI]?.value;
    const decryptedValue = val.value;
    const hasEqValue = Array.isArray(decryptedValue) ? isEqArray : isEqual;

    /** Don't allow replacing bootstrap data with decrypted data. The bootstrap data should take precedent */
    if (!(k in initData) || hasEqValue(initValue, decryptedValue)) {
      /* @ts-ignore: key string vs enum comparison */
      obj[k] = val; // eslint-disable-line no-param-reassign
    }

    return obj;
  }, {});

  return {
    ...initData,
    ...newValues,
  };
};

export default mergeInitialData;
