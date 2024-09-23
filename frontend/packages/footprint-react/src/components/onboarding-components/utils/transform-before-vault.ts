import type { VaultValue } from '@onefootprint/types';
import type { FormValues } from '../../../types';

export const removeEmpty = (
  obj: Partial<Record<keyof FormValues, VaultValue>>,
): Partial<Record<keyof FormValues, VaultValue>> => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => !!value));
};

export const removeUnchanged = (
  data: Partial<Record<keyof FormValues, VaultValue>>,
  vaultValues?: FormValues,
): Partial<Record<keyof FormValues, VaultValue>> => {
  if (!vaultValues) return data;
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== vaultValues[key as keyof FormValues]),
  );
};

const beforeSave = (
  data: Partial<Record<keyof FormValues, VaultValue>>,
  options: {
    vaultValues?: FormValues;
  },
) => {
  const unchangedRemoved = removeUnchanged(data, options.vaultValues);
  return removeEmpty(unchangedRemoved);
};

export default beforeSave;
