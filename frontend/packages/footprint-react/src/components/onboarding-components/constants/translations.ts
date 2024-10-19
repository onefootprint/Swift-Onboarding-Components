const translations = {
  person: {
    phoneNumber: {
      required: 'Phone number is required',
      invalid: 'Phone number is invalid',
    },
    email: {
      required: 'Email is required',
      invalid: 'Email is invalid',
    },
    dob: {
      required: 'Date of birth is required',
      invalid: 'Date of birth is invalid',
    },
    ssn4: {
      required: 'SSN is required',
      invalid: 'SSN is invalid',
    },
    ssn9: {
      required: 'SSN is required',
      invalid: 'SSN is invalid',
    },
    firstName: {
      required: 'First name is required',
      invalid: 'First name is invalid',
    },
    middleName: {
      invalid: 'Middle name is invalid',
    },
    lastName: {
      required: 'Last name is required',
      invalid: 'Last name is invalid',
    },
    country: {
      required: 'Country is required',
    },
    city: {
      required: 'City is required',
    },
    addressLine1: {
      required: 'Address line 1 is required',
    },
    state: {
      required: 'State is required',
    },
    zip: {
      required: 'ZIP code is required',
    },
  },
};

type Translations = typeof translations;

export default translations;
export type { Translations };
