import { getSelectedDataOptions } from './get-selected-data-options';

describe('getSelectedDataOptions', () => {
  it('should return the expected value', () => {
    const response0 = Object.fromEntries(
      getSelectedDataOptions({
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
      getSelectedDataOptions({
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
      getSelectedDataOptions({
        full_address: false,
        dob: false,
        ssn4: false,
        email: false,
        phone_number: false,
      }),
    );
    expect(response2).toEqual({});

    const response3 = Object.fromEntries(getSelectedDataOptions({}));
    expect(response3).toEqual({});
  });
});
