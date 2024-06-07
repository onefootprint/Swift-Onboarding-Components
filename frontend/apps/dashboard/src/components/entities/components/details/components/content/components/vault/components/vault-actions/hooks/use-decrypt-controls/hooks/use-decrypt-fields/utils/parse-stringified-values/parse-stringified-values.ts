import type { DataIdentifier, VaultArrayData, VaultObjectData, VaultTextData, VaultValue } from '@onefootprint/types';

type Output = Partial<Record<DataIdentifier, VaultTextData | VaultArrayData | VaultObjectData>>;

// this function is required because some data is stored as stringified JSON
// business.beneficial_owners "[{\"first_name\":\"Jane\",\"last_name\":\"Doe\",\"ownership_stake\":25}]"
// so we'll need to convert it to an object, array of object, or whatever it is
const parseStringifiedValues = (input: Partial<Record<DataIdentifier, VaultValue>>) => {
  const output: Output = {};

  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        const isArrayOrObject = typeof parsedValue === 'object' && parsedValue !== null;
        output[key as DataIdentifier] = isArrayOrObject ? parsedValue : value;
      } catch (_e) {
        // If parsing fails, keep the original value
        output[key as DataIdentifier] = value;
      }
    }
    if (Array.isArray(value)) {
      output[key as DataIdentifier] = value;
    }
  });

  return output;
};

export default parseStringifiedValues;
