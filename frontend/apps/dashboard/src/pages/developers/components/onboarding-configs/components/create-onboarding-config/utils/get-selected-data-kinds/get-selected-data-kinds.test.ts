import getSelectedDataKinds from './get-selected-data-kinds';

describe('getSelectedDataKinds', () => {
  it('should return the expected value', () => {
    const response0 = Object.fromEntries(
      getSelectedDataKinds({
        city: true,
        country: true,
        dob: true,
        ssn: true,
        email: true,
        name: true,
        phone_number: true,
        state: true,
        street_address: true,
        street_address2: true,
        zip: false,
      }),
    );
    expect(response0).toEqual({
      name: true,
      email: true,
      phone_number: true,
      dob: true,
      ssn: true,
      street_address: true,
      street_address2: true,
      city: true,
      state: true,
      country: true,
    });

    const response1 = Object.fromEntries(
      getSelectedDataKinds({
        city: true,
        country: true,
        dob: true,
        email: true,
        name: true,
        phone_number: true,
        last_four_ssn: true,
        state: true,
        street_address: true,
        street_address2: true,
        zip: false,
      }),
    );
    expect(response1).toEqual({
      name: true,
      email: true,
      phone_number: true,
      dob: true,
      last_four_ssn: true,
      street_address: true,
      street_address2: true,
      city: true,
      state: true,
      country: true,
    });

    const response2 = Object.fromEntries(
      getSelectedDataKinds({
        city: false,
        country: false,
        dob: false,
        email: false,
        name: false,
        phone_number: false,
        state: false,
        street_address: false,
        street_address2: false,
        zip: false,
      }),
    );
    expect(response2).toEqual({});

    const response3 = Object.fromEntries(getSelectedDataKinds({}));
    expect(response3).toEqual({});
  });
});
