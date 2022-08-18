import getSelectedDataKinds from './get-selected-data-kinds';

describe('getSelectedDataKinds', () => {
  it('should return the expected value', () => {
    const response0 = Object.fromEntries(
      getSelectedDataKinds({
        city: true,
        country: true,
        dob: true,
        ssn9: true,
        email: true,
        name: true,
        phone_number: true,
        state: true,
        address_line1: true,
        address_line2: true,
        zip: false,
      }),
    );
    expect(response0).toEqual({
      name: true,
      email: true,
      phone_number: true,
      dob: true,
      ssn9: true,
      address_line1: true,
      address_line2: true,
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
        ssn4: true,
        state: true,
        address_line1: true,
        address_line2: true,
        zip: false,
      }),
    );
    expect(response1).toEqual({
      name: true,
      email: true,
      phone_number: true,
      dob: true,
      ssn4: true,
      address_line1: true,
      address_line2: true,
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
        address_line1: false,
        address_line2: false,
        zip: false,
      }),
    );
    expect(response2).toEqual({});

    const response3 = Object.fromEntries(getSelectedDataKinds({}));
    expect(response3).toEqual({});
  });
});
