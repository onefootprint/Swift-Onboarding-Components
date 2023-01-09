import { getSelectedKycDataOptions } from './get-selected-kyc-data-options';

describe('getSelectedKycDataOptions', () => {
  it('should return the expected value', () => {
    const response0 = Object.fromEntries(
      getSelectedKycDataOptions({
        full_address: true,
        dob: true,
        ssn9: true,
        email: true,
        name: false,
        phone_number: true,
      }),
    );
    expect(response0).toEqual({
      full_address: true,
      dob: true,
      ssn9: true,
      email: true,
      phone_number: true,
    });

    const response1 = Object.fromEntries(
      getSelectedKycDataOptions({
        full_address: true,
        dob: true,
        ssn4: true,
        email: true,
        name: false,
        phone_number: true,
      }),
    );
    expect(response1).toEqual({
      full_address: true,
      dob: true,
      ssn4: true,
      email: true,
      phone_number: true,
    });

    const response2 = Object.fromEntries(
      getSelectedKycDataOptions({
        full_address: false,
        dob: false,
        ssn4: false,
        email: false,
        phone_number: false,
      }),
    );
    expect(response2).toEqual({});

    const response3 = Object.fromEntries(getSelectedKycDataOptions({}));
    expect(response3).toEqual({});
  });
});
