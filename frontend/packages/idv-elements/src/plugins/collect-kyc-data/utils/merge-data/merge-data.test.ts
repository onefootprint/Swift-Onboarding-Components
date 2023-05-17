import { IdDI } from '@onefootprint/types';

import mergeInitialData from './merge-data';

describe('getInitData', () => {
  it('shouldnt replace data when value is the same', () => {
    const initialData = {
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
    };
    const newData = {
      [IdDI.firstName]: { value: 'John' },
      [IdDI.lastName]: { value: 'Smith' },
      [IdDI.dob]: { value: '01/04/1998' },
    };
    expect(mergeInitialData(initialData, newData)).toEqual({
      [IdDI.firstName]: { value: 'John', decrypted: true },
      [IdDI.lastName]: { value: 'Smith', decrypted: true },
      [IdDI.dob]: { value: '01/04/1998' },
    });
  });
});
