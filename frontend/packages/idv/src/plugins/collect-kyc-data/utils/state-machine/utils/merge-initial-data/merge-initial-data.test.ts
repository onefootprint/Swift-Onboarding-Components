import { IdDI } from '@onefootprint/types';

import mergeInitialData, { isEqArray } from './merge-initial-data';

describe('mergeInitialData', () => {
  it('should take bootstrap data over decrypted data', () => {
    const bootstrapData = {
      [IdDI.ssn9]: { value: '111111111', bootstrap: true },
      [IdDI.middleName]: { value: 'C.', decrypted: true },
    };
    const decryptedData = {
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.middleName]: { value: 'M.', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
      [IdDI.ssn9]: { value: '101010101', decrypted: true },
    };
    expect(mergeInitialData(bootstrapData, decryptedData)).toEqual({
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.middleName]: { value: 'C.', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
      [IdDI.ssn9]: { value: '111111111', bootstrap: true },
    });
  });

  it('should replace bootstrap data when value is the same', () => {
    const bootstrapData = {
      [IdDI.middleName]: { value: 'Lee', bootstrap: true },
    };
    const decryptedData = {
      [IdDI.firstName]: { value: 'Bob', decrypted: true },
      [IdDI.middleName]: { value: 'Lee', decrypted: true },
      [IdDI.lastName]: { value: 'Swagger', decrypted: true },
    };
    expect(mergeInitialData(bootstrapData, decryptedData)).toEqual({
      [IdDI.firstName]: { value: 'Bob', decrypted: true },
      [IdDI.middleName]: { value: 'Lee', decrypted: true },
      [IdDI.lastName]: { value: 'Swagger', decrypted: true },
    });
  });
});

describe('isEqArray', () => {
  it.each`
    arrA          | arrB          | output
    ${undefined}  | ${undefined}  | ${false}
    ${null}       | ${null}       | ${false}
    ${[]}         | ${[]}         | ${true}
    ${[1]}        | ${[1]}        | ${true}
    ${[1]}        | ${[1, 2]}     | ${false}
    ${[3, 2, 1]}  | ${[1, 2, 3]}  | ${true}
    ${['a']}      | ${['a']}      | ${true}
    ${['a']}      | ${['a', 'b']} | ${false}
    ${['b', 'a']} | ${['a', 'b']} | ${true}
  `('for $arrB', ({ arrA, arrB, output }) => {
    expect(isEqArray(arrA, arrB)).toBe(output);
  });
});
