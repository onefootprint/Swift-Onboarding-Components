import type { DataIdentifier, VaultArrayData, VaultObjectData, VaultTextData, VaultValue } from '@onefootprint/types';

type Output = Partial<Record<DataIdentifier, VaultTextData | VaultArrayData | VaultObjectData>>;

// this function is required because some data is stored as stringified JSON
// business.beneficial_owners "[{\"first_name\":\"Jane\",\"last_name\":\"Doe\",\"ownership_stake\":25}]"
// so we'll need to convert it to an object, array of object, or whatever it is
// additionally, if seqno is provided (for decrypting a historical version), we'll remove the seqno from the DI
const parseStringifiedValues = (input: Partial<Record<DataIdentifier, VaultValue>>, seqno?: string) => {
  const output: Output = {};

  Object.entries(input).forEach(([key, value]) => {
    const di = (seqno && key.includes(`:${seqno}`) ? key.replace(`:${seqno}`, '') : key) as DataIdentifier;

    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        const isArrayOrObject = typeof parsedValue === 'object' && parsedValue !== null;
        output[di] = isArrayOrObject ? parsedValue : value;
      } catch (_e) {
        // If parsing fails, keep the original value
        output[di] = value;
      }
    }
    if (Array.isArray(value)) {
      output[di] = value;
    }
  });

  return output;
};

export default parseStringifiedValues;
