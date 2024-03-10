import { IdDI } from '@onefootprint/types';

import mergeInitialData from './merge-data';

describe('getInitData', () => {
  it('should replace data when metadata differs', () => {
    const initialData = {
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.middleName]: { value: 'M.', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
    };
    const newData = {
      [IdDI.firstName]: { value: 'John2' },
      [IdDI.middleName]: { value: 'M.', decrypted: true },
      [IdDI.lastName]: { value: 'Smith2' },
      [IdDI.dob]: { value: '01/04/1998' },
    };
    expect(mergeInitialData(initialData, newData)).toEqual({
      [IdDI.firstName]: { value: 'John2' },
      [IdDI.middleName]: { value: 'M.', decrypted: true },
      [IdDI.lastName]: { value: 'Smith2' },
      [IdDI.dob]: { value: '01/04/1998' },
    });
  });
});
