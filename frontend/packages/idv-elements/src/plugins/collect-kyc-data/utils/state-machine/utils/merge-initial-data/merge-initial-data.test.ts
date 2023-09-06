import { IdDI } from '@onefootprint/types';

import mergeInitialData from './merge-initial-data';

describe('getInitData', () => {
  it('should take bootstrap data over decrypted data', () => {
    const initialData = {
      [IdDI.ssn9]: { value: '111111111', bootstrap: true },
    };
    const decryptedData = {
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
      [IdDI.ssn9]: { value: '101010101', decrypted: true },
    };
    expect(mergeInitialData(initialData, decryptedData)).toEqual({
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
      [IdDI.ssn9]: { value: '111111111', bootstrap: true },
    });
  });
});
