import { DataKinds } from 'src/types/data-kind';

import transformDataKindFormToArray from './transform-data-kind-form-to-array';

describe('transformDataKindFormToArray', () => {
  it('should return the expected value', () => {
    const response0 = transformDataKindFormToArray({
      dob: true,
      email: true,
      name: true,
      phone_number: true,
      ssn: true,
      street_address: true,
      street_address2: true,
      zip: true,
    });
    expect(response0).toEqual([
      DataKinds.firstName,
      DataKinds.lastName,
      DataKinds.email,
      DataKinds.phoneNumber,
      DataKinds.ssn,
      DataKinds.dob,
      DataKinds.streetAddress,
      DataKinds.streetAddress2,
      DataKinds.zip,
    ]);

    const response1 = transformDataKindFormToArray({
      dob: true,
      email: true,
      name: true,
      phone_number: true,
      ssn: false,
      streetAddress: true,
      streetAddress2: true,
      zip: false,
    });
    expect(response1).toEqual([
      DataKinds.firstName,
      DataKinds.lastName,
      DataKinds.email,
      DataKinds.phoneNumber,
      DataKinds.dob,
    ]);

    const response2 = transformDataKindFormToArray({
      dob: true,
      email: false,
      name: false,
      phone_number: false,
      ssn: false,
      street_address: true,
      street_address2: true,
      zip: true,
    });
    expect(response2).toEqual([
      DataKinds.dob,
      DataKinds.streetAddress,
      DataKinds.streetAddress2,
      DataKinds.zip,
    ]);

    const response3 = transformDataKindFormToArray({
      dob: false,
      email: false,
      name: false,
      phone_number: false,
      ssn: false,
      street_address: false,
      street_address2: false,
      zip: false,
    });
    expect(response3).toEqual([]);
  });
});
