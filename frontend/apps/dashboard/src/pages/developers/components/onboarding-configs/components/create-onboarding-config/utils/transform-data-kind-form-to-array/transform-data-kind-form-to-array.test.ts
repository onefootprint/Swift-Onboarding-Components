import { DataKinds } from 'src/types/data-kind';

import transformDataKindFormToArray from './transform-data-kind-form-to-array';

describe('transformDataKindFormToArray', () => {
  it('should return the expected value', () => {
    const response0 = transformDataKindFormToArray({
      dob: true,
      email: true,
      name: true,
      phone_number: true,
    });
    expect(response0).toEqual([
      DataKinds.firstName,
      DataKinds.lastName,
      DataKinds.email,
      DataKinds.phoneNumber,
      DataKinds.dob,
    ]);

    const response1 = transformDataKindFormToArray({
      email: true,
      phone_number: true,
      last_four_ssn: true,
    });
    expect(response1).toEqual([
      DataKinds.email,
      DataKinds.phoneNumber,
      DataKinds.lastFourSsn,
    ]);

    const response2 = transformDataKindFormToArray({
      email: true,
      phone_number: true,
      name: true,
    });
    expect(response2).toEqual([
      DataKinds.firstName,
      DataKinds.lastName,
      DataKinds.email,
      DataKinds.phoneNumber,
    ]);

    const response3 = transformDataKindFormToArray({
      email: true,
      phone_number: true,
      address_full: true,
    });
    expect(response3).toEqual([
      DataKinds.zip,
      DataKinds.city,
      DataKinds.country,
      DataKinds.state,
      DataKinds.streetAddress,
      DataKinds.streetAddress2,
      DataKinds.email,
      DataKinds.phoneNumber,
    ]);

    const response4 = transformDataKindFormToArray({
      email: true,
      phone_number: true,
      address_partial: true,
    });
    expect(response4).toEqual([
      DataKinds.zip,
      DataKinds.country,
      DataKinds.email,
      DataKinds.phoneNumber,
    ]);

    const response5 = transformDataKindFormToArray({});
    expect(response5).toEqual([]);
  });
});
