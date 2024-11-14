import type { DataValue } from './data-types';

const updateDataValue = <T>(
  newValue?: T,
  oldValue?: DataValue<T>,
  compareFnOverride?: (a?: T, b?: T) => boolean,
): DataValue<T> => {
  const compareFn =
    compareFnOverride ??
    ((a?: T, b?: T) => {
      // Special logic to handle empty / undefined
      const bothEmpty = !newValue && !oldValue?.value;
      return bothEmpty || a === b;
    });
  const isChanged = !compareFn(newValue, oldValue?.value);
  return {
    value: newValue,
    bootstrap: Boolean(isChanged ? false : oldValue?.bootstrap),
    decrypted: Boolean(isChanged ? false : oldValue?.decrypted),
    dirty: isChanged || oldValue?.dirty,
  };
};

export default updateDataValue;
