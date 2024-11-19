export type PersonFormData = {
  person: {
    address: boolean;
    dob: boolean;
    email: boolean;
    phoneNumber: boolean;
    usLegalStatus: boolean;
    ssn: {
      collect: boolean;
      kind: 'ssn4' | 'ssn9';
      optional: boolean;
    };
    usTaxIdAcceptable: boolean;
  };
};
